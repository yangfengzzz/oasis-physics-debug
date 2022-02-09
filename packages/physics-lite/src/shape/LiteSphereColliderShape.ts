import { ISphereColliderShape } from "@oasis-engine/design";
import { LiteColliderShape } from "./LiteColliderShape";
import { BoundingSphere, Ray, Vector3 } from "oasis-engine";
import { LiteHitResult } from "../LiteHitResult";
import { LitePhysicsMaterial } from "../LitePhysicsMaterial";
import { PhysXPhysicsDebug } from "@yangfengzzz/physics-physx-debug";

/**
 * Sphere collider shape in Lite.
 */
export class LiteSphereColliderShape extends LiteColliderShape implements ISphereColliderShape {
  private static _tempSphere: BoundingSphere = new BoundingSphere();

  private _radius: number = 1;
  private _maxScale: number = 1;

  get worldRadius(): number {
    return this._radius * this._maxScale;
  }

  /**
   * Init sphere shape.
   * @param uniqueID - UniqueID mark collider
   * @param radius - Size of SphereCollider
   * @param material - Material of PhysXCollider
   */
  constructor(uniqueID: number, radius: number, material: LitePhysicsMaterial) {
    super();
    this._radius = radius;
    this._id = uniqueID;

    this._physxColliderShape = PhysXPhysicsDebug.createSphereColliderShape(uniqueID, radius, material._physxMaterial);
  }

  /**
   * {@inheritDoc ISphereColliderShape.setRadius }
   */
  setRadius(value: number): void {
    (<ISphereColliderShape>this._physxColliderShape).setRadius(value);

    this._radius = value;
  }

  /**
   * {@inheritDoc IColliderShape.setWorldScale }
   */
  setWorldScale(scale: Vector3): void {
    this._physxColliderShape.setWorldScale(scale);
    
    this._maxScale = Math.max(scale.x, Math.max(scale.x, scale.y));
  }

  /**
   * @internal
   */
  _raycast(ray: Ray, hit: LiteHitResult): boolean {
    const boundingSphere = LiteSphereColliderShape._tempSphere;
    Vector3.transformCoordinate(this._transform.position, this._collider._transform.worldMatrix, boundingSphere.center);
    boundingSphere.radius = this.worldRadius;

    const rayDistance = ray.intersectSphere(boundingSphere);
    if (rayDistance !== -1) {
      this._updateHitResult(ray, rayDistance, hit, ray.origin, true);
      return true;
    } else {
      return false;
    }
  }
}
