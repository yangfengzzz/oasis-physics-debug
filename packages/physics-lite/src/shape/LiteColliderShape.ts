import { IColliderShape, IPhysicsMaterial } from "@oasis-engine/design";
import { Matrix, Ray, Vector3 } from "oasis-engine";
import { LiteHitResult } from "../LiteHitResult";
import { LiteTransform } from "../LiteTransform";
import { LiteCollider } from "../LiteCollider";
import { LiteUpdateFlag } from "../LiteUpdateFlag";
import { LitePhysicsMaterial } from "../LitePhysicsMaterial";

/**
 * Abstract class for collider shapes.
 */
export abstract class LiteColliderShape implements IColliderShape {
  _physxColliderShape: IColliderShape;

  private static _ray = new Ray();
  private static _tempPoint = new Vector3();

  /** @internal */
  _id: number;
  /** @internal */
  _collider: LiteCollider;
  /** @internal */
  _transform: LiteTransform = new LiteTransform();
  /** @internal */
  _invModelMatrix: Matrix = new Matrix();
  /** @internal */
  _inverseWorldMatFlag: LiteUpdateFlag;

  protected constructor() {
    this._transform.owner = this;
    this._inverseWorldMatFlag = this._transform.registerWorldChangeFlag();
  }

  /**
   * {@inheritDoc IColliderShape.setPosition }
   */
  setPosition(position: Vector3): void {
    this._physxColliderShape.setPosition(position);

    this._transform.setPosition(position.x, position.y, position.z);
  }

  /**
   * {@inheritDoc IColliderShape.setWorldScale }
   */
  abstract setWorldScale(scale: Vector3): void;

  /**
   * {@inheritDoc IColliderShape.setMaterial }
   */
  setMaterial(material: IPhysicsMaterial): void {
    this._physxColliderShape.setMaterial((<LitePhysicsMaterial>material)._physxMaterial);

    throw "Physics-lite don't support setMaterial. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IColliderShape.setUniqueID }
   */
  setUniqueID(id: number): void {
    this._physxColliderShape.setUniqueID(id);

    this._id = id;
  }

  /**
   * {@inheritDoc IColliderShape.setIsTrigger }
   */
  setIsTrigger(value: boolean): void {
    throw "Physics-lite don't support setIsTrigger. Use Physics-PhysX instead!";
  }

  /**
   * {@inheritDoc IColliderShape.setIsSceneQuery }
   */
  setIsSceneQuery(value: boolean): void {
    throw "Physics-lite don't support setIsSceneQuery. Use Physics-PhysX instead!";
  }

  /**
   * @internal
   */
  abstract _raycast(ray: Ray, hit: LiteHitResult): boolean;

  protected _updateHitResult(
    ray: Ray,
    rayDistance: number,
    outHit: LiteHitResult,
    origin: Vector3,
    isWorldRay: boolean = false
  ): void {
    const hitPoint = LiteColliderShape._tempPoint;
    ray.getPoint(rayDistance, hitPoint);
    if (!isWorldRay) {
      Vector3.transformCoordinate(hitPoint, this._transform.worldMatrix, hitPoint);
    }

    const distance = Vector3.distance(origin, hitPoint);

    if (distance < outHit.distance) {
      hitPoint.cloneTo(outHit.point);
      outHit.distance = distance;
      outHit.shapeID = this._id;
    }
  }

  protected _getLocalRay(ray: Ray): Ray {
    const worldToLocal = this._getInvModelMatrix();
    const outRay = LiteColliderShape._ray;

    Vector3.transformCoordinate(ray.origin, worldToLocal, outRay.origin);
    Vector3.transformNormal(ray.direction, worldToLocal, outRay.direction);
    outRay.direction.normalize();

    return outRay;
  }

  private _getInvModelMatrix(): Matrix {
    if (this._inverseWorldMatFlag.flag) {
      Matrix.invert(this._transform.worldMatrix, this._invModelMatrix);
      this._inverseWorldMatFlag.flag = false;
    }
    return this._invModelMatrix;
  }
}
