import { PhysXPhysicsDebug } from "./PhysXPhysicsDebug";
import { Ray, Vector3 } from "oasis-engine";
import { IPhysicsManager } from "@oasis-engine/design";
import { PhysXCollider } from "./PhysXCollider";
import { DisorderedArray } from "./DisorderedArray";
import { PhysXColliderShape } from "./shape/PhysXColliderShape";

/**
 * A manager is a collection of bodies and constraints which can interact.
 */
export class PhysXPhysicsManager implements IPhysicsManager {
  private static _tempPosition: Vector3 = new Vector3();
  private static _tempNormal: Vector3 = new Vector3();
  private static _pxRaycastHit: any;
  private static _pxFilterData: any;

  static _init() {
    PhysXPhysicsManager._pxRaycastHit = new PhysXPhysicsDebug._physX.PxRaycastHit();
    PhysXPhysicsManager._pxFilterData = new PhysXPhysicsDebug._physX.PxQueryFilterData();
    PhysXPhysicsManager._pxFilterData.flags = new PhysXPhysicsDebug._physX.PxQueryFlags(
      QueryFlag.STATIC | QueryFlag.DYNAMIC
    );
  }

  private _pxScene: any;

  private readonly _onContactEnter?: (obj1: number, obj2: number) => void;
  private readonly _onContactExit?: (obj1: number, obj2: number) => void;
  private readonly _onContactStay?: (obj1: number, obj2: number) => void;
  private readonly _onTriggerEnter?: (obj1: number, obj2: number) => void;
  private readonly _onTriggerExit?: (obj1: number, obj2: number) => void;
  private readonly _onTriggerStay?: (obj1: number, obj2: number) => void;

  private _currentEvents: DisorderedArray<TriggerEvent> = new DisorderedArray<TriggerEvent>();
  private _eventMap: Record<number, Record<number, TriggerEvent>> = {};
  private _eventPool: TriggerEvent[] = [];

  constructor(
    onContactEnter?: (obj1: number, obj2: number) => void,
    onContactExit?: (obj1: number, obj2: number) => void,
    onContactStay?: (obj1: number, obj2: number) => void,
    onTriggerEnter?: (obj1: number, obj2: number) => void,
    onTriggerExit?: (obj1: number, obj2: number) => void,
    onTriggerStay?: (obj1: number, obj2: number) => void
  ) {
    this._onContactEnter = onContactEnter;
    this._onContactExit = onContactExit;
    this._onContactStay = onContactStay;
    this._onTriggerEnter = onTriggerEnter;
    this._onTriggerExit = onTriggerExit;
    this._onTriggerStay = onTriggerStay;

    const triggerCallback = {
      onContactBegin: (obj1, obj2) => {},
      onContactEnd: (obj1, obj2) => {},
      onContactPersist: (obj1, obj2) => {},
      onTriggerBegin: (obj1, obj2) => {
        const index1 = obj1.getQueryFilterData().word0;
        const index2 = obj2.getQueryFilterData().word0;
        const event = index1 < index2 ? this._getTrigger(index1, index2) : this._getTrigger(index2, index1);
        event.state = TriggerEventState.Enter;
        this._currentEvents.add(event);
      },
      onTriggerEnd: (obj1, obj2) => {
        const index1 = obj1.getQueryFilterData().word0;
        const index2 = obj2.getQueryFilterData().word0;
        let event: TriggerEvent;
        if (index1 < index2) {
          const subMap = this._eventMap[index1];
          event = subMap[index2];
          subMap[index2] = undefined;
        } else {
          const subMap = this._eventMap[index2];
          event = subMap[index1];
          subMap[index1] = undefined;
        }
        event.state = TriggerEventState.Exit;
      }
    };

    const PHYSXSimulationCallbackInstance = PhysXPhysicsDebug._physX.PxSimulationEventCallback.implement(triggerCallback);
    const sceneDesc = PhysXPhysicsDebug._physX.getDefaultSceneDesc(
      PhysXPhysicsDebug._pxPhysics.getTolerancesScale(),
      0,
      PHYSXSimulationCallbackInstance
    );
    this._pxScene = PhysXPhysicsDebug._pxPhysics.createScene(sceneDesc);
  }

  /**
   * {@inheritDoc IPhysicsManager.setGravity }
   */
  setGravity(value: Vector3) {
    this._pxScene.setGravity(value);
  }

  /**
   * {@inheritDoc IPhysicsManager.addColliderShape }
   */
  addColliderShape(colliderShape: PhysXColliderShape) {
    this._eventMap[colliderShape._id] = {};
  }

  /**
   * {@inheritDoc IPhysicsManager.removeColliderShape }
   */
  removeColliderShape(colliderShape: PhysXColliderShape) {
    delete this._eventMap[colliderShape._id];
  }

  /**
   * {@inheritDoc IPhysicsManager.addCollider }
   */
  addCollider(collider: PhysXCollider): void {
    this._pxScene.addActor(collider._pxActor, null);
  }

  /**
   * {@inheritDoc IPhysicsManager.removeCollider }
   */
  removeCollider(collider: PhysXCollider): void {
    this._pxScene.removeActor(collider._pxActor, true);
  }

  /**
   * {@inheritDoc IPhysicsManager.update }
   */
  update(elapsedTime: number): void {
    this._simulate(elapsedTime);
    this._fetchResults();
    this._fireEvent();
  }

  /**
   * {@inheritDoc IPhysicsManager.raycast }
   */
  raycast(
    ray: Ray,
    distance: number,
    hit?: (shapeUniqueID: number, distance: number, position: Vector3, normal: Vector3) => void
  ): boolean {
    const { _pxRaycastHit: pxHitResult } = PhysXPhysicsManager;

    const result = this._pxScene.raycastSingle(
      ray.origin,
      ray.direction,
      distance,
      pxHitResult,
      PhysXPhysicsManager._pxFilterData
    );

    if (result && hit != undefined) {
      const { _tempPosition: position, _tempNormal: normal } = PhysXPhysicsManager;
      const { position: pxPosition, normal: pxNormal } = pxHitResult;
      position.setValue(pxPosition.x, pxPosition.y, pxPosition.z);
      normal.setValue(pxNormal.x, pxNormal.y, pxNormal.z);

      hit(pxHitResult.getShape().getQueryFilterData().word0, pxHitResult.distance, position, normal);
    }
    return result;
  }

  private _simulate(elapsedTime: number): void {
    this._pxScene.simulate(elapsedTime, true);
  }

  private _fetchResults(block: boolean = true): void {
    this._pxScene.fetchResults(block);
  }

  private _getTrigger(index1: number, index2: number): TriggerEvent {
    const event = this._eventPool.length ? this._eventPool.pop() : new TriggerEvent(index1, index2);
    this._eventMap[index1][index2] = event;
    return event;
  }

  private _fireEvent(): void {
    const { _eventPool: eventPool, _currentEvents: currentEvents } = this;
    for (let i = 0, n = currentEvents.length; i < n; ) {
      const event = currentEvents.get(i);
      if (event.state == TriggerEventState.Enter) {
        this._onTriggerEnter(event.index1, event.index2);
        event.state = TriggerEventState.Stay;
        i++;
      } else if (event.state == TriggerEventState.Stay) {
        this._onTriggerStay(event.index1, event.index2);
        i++;
      } else if (event.state == TriggerEventState.Exit) {
        this._onTriggerExit(event.index1, event.index2);
        currentEvents.deleteByIndex(i);
        eventPool.push(event);
        n--;
      }
    }
  }
}

/**
 * Filtering flags for scene queries.
 */
enum QueryFlag {
  STATIC = 1 << 0,
  DYNAMIC = 1 << 1,
  ANY_HIT = 1 << 4,
  NO_BLOCK = 1 << 5
}

/**
 * Physics state
 */
enum TriggerEventState {
  Enter,
  Stay,
  Exit
}

/**
 * Trigger event to store interactive object ids and state.
 */
class TriggerEvent {
  state: TriggerEventState;
  index1: number;
  index2: number;

  constructor(index1: number, index2: number) {
    this.index1 = index1;
    this.index2 = index2;
  }
}
