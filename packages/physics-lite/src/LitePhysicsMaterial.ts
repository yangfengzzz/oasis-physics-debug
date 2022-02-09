import { IPhysicsMaterial } from "@oasis-engine/design";
import { PhysXPhysicsDebug } from "@yangfengzzz/physics-physx-debug";

/**
 * Physics material describes how to handle colliding objects (friction, bounciness).
 */
export class LitePhysicsMaterial implements IPhysicsMaterial {
  _physxMaterial: IPhysicsMaterial;

  constructor(
    staticFriction: number,
    dynamicFriction: number,
    bounciness: number,
    frictionCombine: number,
    bounceCombine: number
  ) {
    this._physxMaterial = PhysXPhysicsDebug.createPhysicsMaterial(
      staticFriction,
      dynamicFriction,
      bounciness,
      frictionCombine,
      bounceCombine
    );
  }

  /**
   * {@inheritDoc IPhysicsMaterial.setBounciness }
   */
  setBounciness(value: number): void {
    throw "Physics-lite don't support physics material. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IPhysicsMaterial.setDynamicFriction }
   */
  setDynamicFriction(value: number): void {
    throw "Physics-lite don't support physics material. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IPhysicsMaterial.setStaticFriction }
   */
  setStaticFriction(value: number): void {
    throw "Physics-lite don't support physics material. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IPhysicsMaterial.setBounceCombine }
   */
  setBounceCombine(value: number): void {
    throw "Physics-lite don't support physics material. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IPhysicsMaterial.setFrictionCombine }
   */
  setFrictionCombine(value: number): void {
    throw "Physics-lite don't support physics material. Use Physics-PhysX instead!";
  }
}
