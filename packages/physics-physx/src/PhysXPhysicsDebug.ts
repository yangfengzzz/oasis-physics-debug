import {
  IBoxColliderShape,
  ICapsuleColliderShape,
  IDynamicCollider,
  IPhysics,
  IPhysicsManager,
  IPhysicsMaterial,
  IPlaneColliderShape,
  ISphereColliderShape,
  IStaticCollider
} from "@oasis-engine/design";
import { PhysXPhysicsMaterial } from "./PhysXPhysicsMaterial";
import { PhysXPhysicsManager } from "./PhysXPhysicsManager";
import { PhysXBoxColliderShape } from "./shape/PhysXBoxColliderShape";
import { PhysXSphereColliderShape } from "./shape/PhysXSphereColliderShape";
import { PhysXCapsuleColliderShape } from "./shape/PhysXCapsuleColliderShape";
import { PhysXDynamicCollider } from "./PhysXDynamicCollider";
import { PhysXStaticCollider } from "./PhysXStaticCollider";
import { StaticInterfaceImplement } from "./StaticInterfaceImplement";
import { Entity, Quaternion, Vector3, WebGLEngine } from "oasis-engine";
import { PhysXPlaneColliderShape } from "./shape/PhysXPlaneColliderShape";
import { PhysXRuntimeMode } from "./enum/PhysXRuntimeMode";

/**
 * PhysX object creation.
 */
@StaticInterfaceImplement<IPhysics>()
export class PhysXPhysicsDebug {
  static _rootEntity: Entity;
  static _engine: WebGLEngine;

  /** @internal PhysX wasm object */
  static _physX: any;
  /** @internal Physx physics object */
  static _pxPhysics: any;

  static setEngine(engine: WebGLEngine) {
    this._engine = engine;
    const scene = this._engine.sceneManager.activeScene;
    this._rootEntity = scene.createRootEntity();
  }

  /**
   * Initialize PhysXPhysics.
   * @param runtimeMode - Runtime mode
   * @returns Promise object
   */
  public static init(runtimeMode: PhysXRuntimeMode = PhysXRuntimeMode.Auto): Promise<void> {
    const scriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      document.body.appendChild(script);
      script.async = true;
      script.onload = resolve;

      const supported = (() => {
        try {
          if (typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function") {
            const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
            if (module instanceof WebAssembly.Module)
              return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
          }
        } catch (e) {}
        return false;
      })();
      if (runtimeMode == PhysXRuntimeMode.Auto) {
        if (supported) {
          runtimeMode = PhysXRuntimeMode.WebAssembly;
        } else {
          runtimeMode = PhysXRuntimeMode.JavaScript;
        }
      }

      if (runtimeMode == PhysXRuntimeMode.JavaScript) {
        script.src = "https://gw.alipayobjects.com/os/lib/yangfengzzz/physics-physx-debug/0.6.11/dist/physx.release.js";
      } else if (runtimeMode == PhysXRuntimeMode.WebAssembly) {
        script.src = "https://gw.alipayobjects.com/os/lib/yangfengzzz/physics-physx-debug/0.6.11/dist/physx.release.js";
      }
    });

    return new Promise((resolve) => {
      scriptPromise.then(() => {
        (<any>window).PHYSX().then((PHYSX) => {
          PhysXPhysicsDebug._init(PHYSX);
          PhysXPhysicsManager._init();
          console.log("PhysX loaded.");
          resolve();
        });
      });
    });
  }

  /**
   * {@inheritDoc IPhysics.createPhysicsManager }
   */
  static createPhysicsManager(
    onContactBegin?: (obj1: number, obj2: number) => void,
    onContactEnd?: (obj1: number, obj2: number) => void,
    onContactStay?: (obj1: number, obj2: number) => void,
    onTriggerBegin?: (obj1: number, obj2: number) => void,
    onTriggerEnd?: (obj1: number, obj2: number) => void,
    onTriggerStay?: (obj1: number, obj2: number) => void
  ): IPhysicsManager {
    return new PhysXPhysicsManager(
      onContactBegin,
      onContactEnd,
      onContactStay,
      onTriggerBegin,
      onTriggerEnd,
      onTriggerStay
    );
  }

  /**
   * {@inheritDoc IPhysics.createStaticCollider }
   */
  static createStaticCollider(position: Vector3, rotation: Quaternion): IStaticCollider {
    return new PhysXStaticCollider(position, rotation);
  }

  /**
   * {@inheritDoc IPhysics.createDynamicCollider }
   */
  static createDynamicCollider(position: Vector3, rotation: Quaternion): IDynamicCollider {
    return new PhysXDynamicCollider(position, rotation);
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
    return new PhysXPhysicsMaterial(staticFriction, dynamicFriction, bounciness, frictionCombine, bounceCombine);
  }

  /**
   * {@inheritDoc IPhysics.createBoxColliderShape }
   */
  static createBoxColliderShape(uniqueID: number, size: Vector3, material: PhysXPhysicsMaterial): IBoxColliderShape {
    return new PhysXBoxColliderShape(uniqueID, size, material);
  }

  /**
   * {@inheritDoc IPhysics.createSphereColliderShape }
   */
  static createSphereColliderShape(
    uniqueID: number,
    radius: number,
    material: PhysXPhysicsMaterial
  ): ISphereColliderShape {
    return new PhysXSphereColliderShape(uniqueID, radius, material);
  }

  /**
   * {@inheritDoc IPhysics.createPlaneColliderShape }
   */
  static createPlaneColliderShape(uniqueID: number, material: PhysXPhysicsMaterial): IPlaneColliderShape {
    return new PhysXPlaneColliderShape(uniqueID, material);
  }

  /**
   * {@inheritDoc IPhysics.createCapsuleColliderShape }
   */
  static createCapsuleColliderShape(
    uniqueID: number,
    radius: number,
    height: number,
    material: PhysXPhysicsMaterial
  ): ICapsuleColliderShape {
    return new PhysXCapsuleColliderShape(uniqueID, radius, height, material);
  }

  private static _init(PHYSX: any): void {
    PhysXPhysicsDebug._physX = PHYSX;
    const version = PhysXPhysicsDebug._physX.PX_PHYSICS_VERSION;
    const defaultErrorCallback = new PhysXPhysicsDebug._physX.PxDefaultErrorCallback();
    const allocator = new PhysXPhysicsDebug._physX.PxDefaultAllocator();
    const foundation = PhysXPhysicsDebug._physX.PxCreateFoundation(version, allocator, defaultErrorCallback);

    this._pxPhysics = PhysXPhysicsDebug._physX.PxCreatePhysics(
      version,
      foundation,
      new PhysXPhysicsDebug._physX.PxTolerancesScale(),
      false,
      null
    );

    PhysXPhysicsDebug._physX.PxInitExtensions(this._pxPhysics, null);
  }
}
