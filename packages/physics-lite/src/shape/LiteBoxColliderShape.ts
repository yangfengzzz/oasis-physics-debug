import { IBoxColliderShape } from "@oasis-engine/design";
import { BoundingBox, Ray, Vector3 } from "oasis-engine";
import { LiteColliderShape } from "./LiteColliderShape";
import { LiteHitResult } from "../LiteHitResult";
import { LitePhysicsMaterial } from "../LitePhysicsMaterial";
import { PhysXPhysicsDebug } from "@yangfengzzz/physics-physx-debug";

/**
 * Box collider shape in Lite.
 */
export class LiteBoxColliderShape extends LiteColliderShape implements IBoxColliderShape {
  private static _tempBox: BoundingBox = new BoundingBox();
  private _halfSize: Vector3 = new Vector3();

  /** @internal */
  _boxMin: Vector3 = new Vector3(-0.5, -0.5, -0.5);
  /** @internal */
  _boxMax: Vector3 = new Vector3(0.5, 0.5, 0.5);

  /**
   * Init Box Shape.
   * @param uniqueID - UniqueID mark Shape.
   * @param size - Size of Shape.
   * @param material - Material of PhysXCollider.
   */
  constructor(uniqueID: number, size: Vector3, material: LitePhysicsMaterial) {
    super();
    this._id = uniqueID;
    this._halfSize.setValue(size.x * 0.5, size.y * 0.5, size.z * 0.5);
    this._setBondingBox();

    this._physxColliderShape = PhysXPhysicsDebug.createBoxColliderShape(uniqueID, size, material._physxMaterial);
  }

  /**
   * {@inheritDoc IColliderShape.setPosition }
   */
  setPosition(position: Vector3): void {
    this._physxColliderShape.setPosition(position);

    super.setPosition(position);
    this._setBondingBox();
  }

  /**
   * {@inheritDoc IColliderShape.setWorldScale }
   */
  setWorldScale(scale: Vector3): void {
    this._physxColliderShape.setWorldScale(scale);

    this._transform.setScale(scale.x, scale.y, scale.z);
  }

  /**
   * {@inheritDoc IBoxColliderShape.setSize }
   */
  setSize(value: Vector3): void {
    (<IBoxColliderShape>this._physxColliderShape).setSize(value);

    this._halfSize.setValue(value.x * 0.5, value.y * 0.5, value.z * 0.5);
    this._setBondingBox();
  }

  /**
   * @internal
   */
  _raycast(ray: Ray, hit: LiteHitResult): boolean {
    const localRay = this._getLocalRay(ray);

    const boundingBox = LiteBoxColliderShape._tempBox;
    boundingBox.min.setValue(-this._halfSize.x, -this._halfSize.y, -this._halfSize.z);
    boundingBox.max.setValue(this._halfSize.x, this._halfSize.y, this._halfSize.z);
    const rayDistance = localRay.intersectBox(boundingBox);
    if (rayDistance !== -1) {
      this._updateHitResult(localRay, rayDistance, hit, ray.origin);
      return true;
    } else {
      return false;
    }
  }

  private _setBondingBox(): void {
    const { position: center } = this._transform;
    const halfSize = this._halfSize;

    Vector3.add(center, halfSize, this._boxMax);
    Vector3.subtract(center, halfSize, this._boxMin);
  }
}
