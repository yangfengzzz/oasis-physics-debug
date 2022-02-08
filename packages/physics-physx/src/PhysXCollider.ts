import { ICollider } from "@oasis-engine/design";
import { Quaternion, Vector3 } from "oasis-engine";
import { PhysXColliderShape } from "./shape/PhysXColliderShape";

/**
 * Abstract class of physical collider.
 */
export abstract class PhysXCollider implements ICollider {
  private static _tempTransform: {
    translation: Vector3;
    rotation: Quaternion;
  } = { translation: null, rotation: null };

  /** @internal */
  _pxActor: any;

  /**
   * {@inheritDoc ICollider.addShape }
   */
  addShape(shape: PhysXColliderShape): void {
    this._pxActor.attachShape(shape._pxShape);
  }

  /**
   * {@inheritDoc ICollider.removeShape }
   */
  removeShape(shape: PhysXColliderShape): void {
    this._pxActor.detachShape(shape._pxShape, true);
  }

  /**
   * {@inheritDoc ICollider.setWorldTransform }
   */
  setWorldTransform(position: Vector3, rotation: Quaternion): void {
    this._pxActor.setGlobalPose(this._transform(position, rotation), true);
  }

  /**
   * {@inheritDoc ICollider.getWorldTransform }
   */
  getWorldTransform(outPosition: Vector3, outRotation: Quaternion): void {
    const transform = this._pxActor.getGlobalPose();
    outPosition.setValue(transform.translation.x, transform.translation.y, transform.translation.z);
    outRotation.setValue(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w);
  }

  /**
   * @internal
   */
  _transform(pos: Vector3, rot: Quaternion): { translation: Vector3; rotation: Quaternion } {
    const transform = PhysXCollider._tempTransform;
    transform.translation = pos;
    transform.rotation = rot.normalize();
    return transform;
  }
}
