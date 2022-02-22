import { PhysXColliderShape } from "./PhysXColliderShape";
import { IPlaneColliderShape } from "@oasis-engine/design";
import { PhysXPhysicsMaterial } from "../PhysXPhysicsMaterial";
import { PhysXPhysicsDebug } from "../PhysXPhysicsDebug";
import { Quaternion, Vector3 } from "oasis-engine";

/**
 * Plane collider shape in PhysX.
 */
export class PhysXPlaneColliderShape extends PhysXColliderShape implements IPlaneColliderShape {
  /**
   * Init PhysXCollider and alloc PhysX objects.
   * @param uniqueID - UniqueID mark collider
   * @param material - Material of PhysXCollider
   */
  constructor(uniqueID: number, material: PhysXPhysicsMaterial) {
    super();
    this._rotation.setValue(0, 0, PhysXColliderShape.halfSqrt, PhysXColliderShape.halfSqrt);

    this._pxGeometry = new PhysXPhysicsDebug._physX.PxPlaneGeometry();
    this._allocShape(material);
    this._setLocalPose(this._scale);
    this.setUniqueID(uniqueID);
  }

  /**
   * {@inheritDoc IPlaneColliderShape.setRotation }
   */
  setRotation(value: Vector3): void {
    Quaternion.rotationYawPitchRoll(value.x, value.y, value.z, this._rotation);
    Quaternion.rotateZ(this._rotation, Math.PI * 0.5, this._rotation);
    this._rotation.normalize();
    this._setLocalPose(this._scale);
  }

  /**
   * {@inheritDoc IColliderShape.setWorldScale }
   */
  setWorldScale(scale: Vector3): void {
    this._setLocalPose(this._scale);
  }
}
