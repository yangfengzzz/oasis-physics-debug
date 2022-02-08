import { PhysXPhysicsDebug } from "../PhysXPhysicsDebug";
import { ISphereColliderShape } from "@oasis-engine/design";
import { PhysXColliderShape } from "./PhysXColliderShape";
import { PhysXPhysicsMaterial } from "../PhysXPhysicsMaterial";
import { BlinnPhongMaterial, Entity, MeshRenderer, Vector3 } from "oasis-engine";
import { WireFramePrimitive } from "@yangfengzzz/physics-gizmo";

/**
 * Sphere collider shape in PhysX.
 */
export class PhysXSphereColliderShape extends PhysXColliderShape implements ISphereColliderShape {
  private _radius: number;
  private _maxScale: number = 1;

  /**
   * Init PhysXCollider and alloc PhysX objects.
   * @param uniqueID - UniqueID mark collider
   * @param radius - Size of SphereCollider
   * @param material - Material of PhysXCollider
   */
  constructor(uniqueID: number, radius: number, material: PhysXPhysicsMaterial) {
    super();

    this._radius = radius;

    this._pxGeometry = new PhysXPhysicsDebug._physX.PxSphereGeometry(this._radius * this._maxScale);
    this._allocShape(material);
    this._setLocalPose();
    this.setUniqueID(uniqueID);
  }

  setEntity(value: Entity) {
    super.setEntity(value);
    const renderer = this._entity.addComponent(MeshRenderer);
    renderer.setMaterial(new BlinnPhongMaterial(PhysXPhysicsDebug._engine));
    renderer.mesh = WireFramePrimitive.createSphereWireFrame(PhysXPhysicsDebug._engine, 1);
    this._syncSphereGeometry();
  }

  /**
   * {@inheritDoc ISphereColliderShape.setRadius }
   */
  setRadius(value: number): void {
    this._radius = value;
    this._pxGeometry.radius = value * this._maxScale;
    this._pxShape.setGeometry(this._pxGeometry);
    this._syncSphereGeometry();
  }

  /**
   * {@inheritDoc IColliderShape.setWorldScale }
   */
  setWorldScale(scale: Vector3): void {
    this._maxScale = Math.max(scale.x, Math.max(scale.x, scale.y));
    this._pxGeometry.radius = this._radius * this._maxScale;
    this._pxShape.setGeometry(this._pxGeometry);
    // scale offset
    const trans = this._pxShape.getLocalPose();
    this._position.setValue(trans.translation.x, trans.translation.y, trans.translation.z);
    this._position.multiply(scale);
    this.setPosition(this._position);

    this._syncSphereGeometry();
  }

  private _syncSphereGeometry() {
    if (this._entity) {
      const radius = this._pxGeometry.radius;
      this._entity.transform.setScale(radius, radius, radius);
    }
  }
}
