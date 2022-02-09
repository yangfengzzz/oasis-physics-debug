import {
  IPhysics,
  IPhysicsMaterial,
  IPhysicsManager,
  IBoxColliderShape,
  ISphereColliderShape,
  ICapsuleColliderShape,
  IDynamicCollider,
  IStaticCollider,
  IPlaneColliderShape
} from "@oasis-engine/design";
import { StaticInterfaceImplement } from "./StaticInterfaceImplement";
import { Quaternion, Vector3, WebGLEngine } from "oasis-engine";
import { LiteStaticCollider } from "./LiteStaticCollider";
import { LitePhysicsMaterial } from "./LitePhysicsMaterial";
import { LiteBoxColliderShape } from "./shape/LiteBoxColliderShape";
import { LitePhysicsManager } from "./LitePhysicsManager";
import { LiteSphereColliderShape } from "./shape/LiteSphereColliderShape";
import { LiteDynamicCollider } from "./LiteDynamicCollider";
import { PhysXPhysicsDebug, PhysXRuntimeMode } from "@yangfengzzz/physics-physx-debug";

@StaticInterfaceImplement<IPhysics>()
export class LitePhysicsDebug {
  static _physxPhysicsDebug: IPhysics;

  /**
   * Initialize PhysXPhysics.
   * @param runtimeMode - Runtime mode
   * @returns Promise object
   */
  static init(runtimeMode: PhysXRuntimeMode = PhysXRuntimeMode.Auto): Promise<void> {
    this._physxPhysicsDebug = PhysXPhysicsDebug;
    return PhysXPhysicsDebug.init(runtimeMode);
  }

  static setEngine(engine: WebGLEngine) {
    PhysXPhysicsDebug.setEngine(engine);
  }

  /**
   * {@inheritDoc IPhysics.createPhysicsManager }
   */
  static createPhysicsManager(
    onContactBegin?: (obj1: number, obj2: number) => void,
    onContactEnd?: (obj1: number, obj2: number) => void,
    onContactPersist?: (obj1: number, obj2: number) => void,
    onTriggerBegin?: (obj1: number, obj2: number) => void,
    onTriggerEnd?: (obj1: number, obj2: number) => void,
    onTriggerPersist?: (obj1: number, obj2: number) => void
  ): IPhysicsManager {
    return new LitePhysicsManager(
      onContactBegin,
      onContactEnd,
      onContactPersist,
      onTriggerBegin,
      onTriggerEnd,
      onTriggerPersist
    );
  }

  /**
   * {@inheritDoc IPhysics.createStaticCollider }
   */
  static createStaticCollider(position: Vector3, rotation: Quaternion): IStaticCollider {
    return new LiteStaticCollider(position, rotation);
  }

  /**
   * {@inheritDoc IPhysics.createDynamicCollider }
   */
  static createDynamicCollider(position: Vector3, rotation: Quaternion): IDynamicCollider {
    return new LiteDynamicCollider(position, rotation);
  }

  /**
   * {@inheritDoc IPhysics.createPhysicsMaterial }
   */
  static createPhysicsMaterial(
    staticFriction: number,
    dynamicFriction: number,
    bounciness: number,
    frictionCombine: number,
    bounceCombine: number
  ): IPhysicsMaterial {
    return new LitePhysicsMaterial(staticFriction, dynamicFriction, bounciness, frictionCombine, bounceCombine);
  }

  /**
   * {@inheritDoc IPhysics.createBoxColliderShape }
   */
  static createBoxColliderShape(uniqueID: number, size: Vector3, material: LitePhysicsMaterial): IBoxColliderShape {
    return new LiteBoxColliderShape(uniqueID, size, material);
  }

  /**
   * {@inheritDoc IPhysics.createSphereColliderShape }
   */
  static createSphereColliderShape(
    uniqueID: number,
    radius: number,
    material: LitePhysicsMaterial
  ): ISphereColliderShape {
    return new LiteSphereColliderShape(uniqueID, radius, material);
  }

  /**
   * {@inheritDoc IPhysics.createPlaneColliderShape }
   */
  static createPlaneColliderShape(uniqueID: number, material: LitePhysicsMaterial): IPlaneColliderShape {
    throw "Physics-lite don't support PlaneColliderShape. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IPhysics.createCapsuleColliderShape }
   */
  static createCapsuleColliderShape(
    uniqueID: number,
    radius: number,
    height: number,
    material: LitePhysicsMaterial
  ): ICapsuleColliderShape {
    throw "Physics-lite don't support CapsuleColliderShape. Use Physics-PhysX instead!";
  }
}
