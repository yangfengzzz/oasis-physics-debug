import { PhysXPhysicsDebug } from "./PhysXPhysicsDebug";
import { IPhysicsMaterial } from "@oasis-engine/design";

/**
 * Physics material describes how to handle colliding objects (friction, bounciness).
 */
export class PhysXPhysicsMaterial implements IPhysicsMaterial {
  /** @internal */
  _pxMaterial: any;

  constructor(
    staticFriction: number,
    dynamicFriction: number,
    bounciness: number,
    frictionCombine: CombineMode,
    bounceCombine: CombineMode
  ) {
    const pxMaterial = PhysXPhysicsDebug._pxPhysics.createMaterial(staticFriction, dynamicFriction, bounciness);
    pxMaterial.setFrictionCombineMode(frictionCombine);
    pxMaterial.setRestitutionCombineMode(bounceCombine);
    this._pxMaterial = pxMaterial;
  }

  /**
   * {@inheritDoc IPhysicsMaterial.setBounciness }
   */
  setBounciness(value: number) {
    this._pxMaterial.setRestitution(value);
  }

  /**
   * {@inheritDoc IPhysicsMaterial.setDynamicFriction }
   */
  setDynamicFriction(value: number) {
    this._pxMaterial.setDynamicFriction(value);
  }

  /**
   * {@inheritDoc IPhysicsMaterial.setStaticFriction }
   */
  setStaticFriction(value: number) {
    this._pxMaterial.setStaticFriction(value);
  }

  /**
   * {@inheritDoc IPhysicsMaterial.setBounceCombine }
   */
  setBounceCombine(value: CombineMode) {
    this._pxMaterial.setRestitutionCombineMode(value);
  }

  /**
   * {@inheritDoc IPhysicsMaterial.setFrictionCombine }
   */
  setFrictionCombine(value: CombineMode) {
    this._pxMaterial.setFrictionCombineMode(value);
  }
}

/**
 * Describes how physics materials of the colliding objects are combined.
 */
enum CombineMode {
  /** Averages the friction/bounce of the two colliding materials. */
  Average,
  /** Uses the smaller friction/bounce of the two colliding materials. */
  Minimum,
  /** Multiplies the friction/bounce of the two colliding materials. */
  Multiply,
  /** Uses the larger friction/bounce of the two colliding materials. */
  Maximum
}
