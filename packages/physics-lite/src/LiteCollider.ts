import { ICollider } from "@oasis-engine/design";
import { Quaternion, Ray, Vector3 } from "oasis-engine";
import { LiteHitResult } from "./LiteHitResult";
import { LiteColliderShape } from "./shape/LiteColliderShape";
import { LiteTransform } from "./LiteTransform";

/**
 * Abstract class of physical collider.
 */
export abstract class LiteCollider implements ICollider {
  _physxCollider: ICollider;

  /** @internal */
  _shapes: LiteColliderShape[] = [];
  /** @internal */
  _transform: LiteTransform = new LiteTransform();

  protected constructor() {
    this._transform.owner = this;
  }

  /**
   * {@inheritDoc ICollider.addShape }
   */
  addShape(shape: LiteColliderShape): void {
    this._physxCollider.addShape(shape._physxColliderShape);

    const oldCollider = shape._collider;
    if (oldCollider !== this) {
      if (oldCollider) {
        oldCollider.removeShape(shape);
      }
      this._shapes.push(shape);
      shape._collider = this;
    }
  }

  /**
   * {@inheritDoc ICollider.removeShape }
   */
  removeShape(shape: LiteColliderShape): void {
    this._physxCollider.removeShape(shape._physxColliderShape);

    const index = this._shapes.indexOf(shape);
    if (index !== -1) {
      this._shapes.splice(index, 1);
      shape._collider = null;
    }
  }

  /**
   * {@inheritDoc ICollider.setWorldTransform }
   */
  setWorldTransform(position: Vector3, rotation: Quaternion): void {
    this._physxCollider.setWorldTransform(position, rotation);

    this._transform.setPosition(position.x, position.y, position.z);
    this._transform.setRotationQuaternion(rotation.x, rotation.y, rotation.z, rotation.w);
  }

  /**
   * {@inheritDoc ICollider.getWorldTransform }
   */
  getWorldTransform(outPosition: Vector3, outRotation: Quaternion): void {
    this._physxCollider.getWorldTransform(outPosition, outRotation);

    const { position, rotationQuaternion } = this._transform;
    outPosition.setValue(position.x, position.y, position.z);
    outRotation.setValue(rotationQuaternion.x, rotationQuaternion.y, rotationQuaternion.z, rotationQuaternion.w);
  }

  /**
   * @internal
   */
  _raycast(ray: Ray, hit: LiteHitResult): boolean {
    hit.distance = Number.MAX_VALUE;
    const shapes = this._shapes;
    for (let i = 0, n = shapes.length; i < n; i++) {
      shapes[i]._raycast(ray, hit);
    }

    return hit.distance != Number.MAX_VALUE;
  }
}
