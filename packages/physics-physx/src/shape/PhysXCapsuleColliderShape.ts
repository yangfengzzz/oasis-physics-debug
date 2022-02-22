import { PhysXPhysicsDebug } from "../PhysXPhysicsDebug";
import { ICapsuleColliderShape } from "@oasis-engine/design";
import { PhysXColliderShape } from "./PhysXColliderShape";
import { PhysXPhysicsMaterial } from "../PhysXPhysicsMaterial";
import { BlinnPhongMaterial, Entity, MeshRenderer, Vector3 } from "oasis-engine";
import { WireFramePrimitive } from "@yangfengzzz/physics-gizmo";

/**
 * Capsule collider shape in PhysX.
 */
export class PhysXCapsuleColliderShape extends PhysXColliderShape implements ICapsuleColliderShape {
  private _radius: number;
  private _halfHeight: number;
  private _upAxis: ColliderShapeUpAxis = ColliderShapeUpAxis.Y;
  private _renderer: MeshRenderer;

  /**
   * Init PhysXCollider and alloc PhysX objects.
   * @param uniqueID - UniqueID mark collider
   * @param radius - Radius of CapsuleCollider
   * @param height - Height of CapsuleCollider
   * @param material - Material of PhysXCollider
   */
  constructor(uniqueID: number, radius: number, height: number, material: PhysXPhysicsMaterial) {
    super();

    this._radius = radius;
    this._halfHeight = height * 0.5;

    this._pxGeometry = new PhysXPhysicsDebug._physX.PxCapsuleGeometry(this._radius, this._halfHeight);
    this._allocShape(material);
    this._setLocalPose(this._scale);
    this.setUniqueID(uniqueID);
  }

  setEntity(value: Entity) {
    super.setEntity(value);
    this._renderer = this._entity.addComponent(MeshRenderer);
    this._renderer.setMaterial(new BlinnPhongMaterial(PhysXPhysicsDebug._engine));
    this._syncCapsuleGeometry();
  }

  /**
   * {@inheritDoc ICapsuleColliderShape.setRadius }
   */
  setRadius(value: number): void {
    this._radius = value;
    switch (this._upAxis) {
      case ColliderShapeUpAxis.X:
        this._pxGeometry.radius = this._radius * Math.max(this._scale.y, this._scale.z);
        break;
      case ColliderShapeUpAxis.Y:
        this._pxGeometry.radius = this._radius * Math.max(this._scale.x, this._scale.z);
        break;
      case ColliderShapeUpAxis.Z:
        this._pxGeometry.radius = this._radius * Math.max(this._scale.x, this._scale.y);
        break;
    }
    this._pxShape.setGeometry(this._pxGeometry);
    this._syncCapsuleGeometry();
  }

  /**
   * {@inheritDoc ICapsuleColliderShape.setHeight }
   */
  setHeight(value: number): void {
    this._halfHeight = value * 0.5;
    switch (this._upAxis) {
      case ColliderShapeUpAxis.X:
        this._pxGeometry.halfHeight = this._halfHeight * this._scale.x;
        break;
      case ColliderShapeUpAxis.Y:
        this._pxGeometry.halfHeight = this._halfHeight * this._scale.y;
        break;
      case ColliderShapeUpAxis.Z:
        this._pxGeometry.halfHeight = this._halfHeight * this._scale.z;
        break;
    }
    this._pxShape.setGeometry(this._pxGeometry);
    this._syncCapsuleGeometry();
  }

  /**
   * {@inheritDoc ICapsuleColliderShape.setUpAxis }
   */
  setUpAxis(upAxis: ColliderShapeUpAxis): void {
    this._upAxis = upAxis;
    switch (this._upAxis) {
      case ColliderShapeUpAxis.X:
        this._rotation.setValue(0, 0, 0, 1);
        break;
      case ColliderShapeUpAxis.Y:
        this._rotation.setValue(0, 0, PhysXColliderShape.halfSqrt, PhysXColliderShape.halfSqrt);
        break;
      case ColliderShapeUpAxis.Z:
        this._rotation.setValue(0, PhysXColliderShape.halfSqrt, 0, PhysXColliderShape.halfSqrt);
        break;
    }
    this._setLocalPose(this._scale);
  }

  /**
   * {@inheritDoc IColliderShape.setWorldScale }
   */
  setWorldScale(scale: Vector3): void {
    this._setLocalPose(this._scale);

    switch (this._upAxis) {
      case ColliderShapeUpAxis.X:
        this._pxGeometry.radius = this._radius * Math.max(scale.y, scale.z);
        this._pxGeometry.halfHeight = this._halfHeight * scale.x;
        break;
      case ColliderShapeUpAxis.Y:
        this._pxGeometry.radius = this._radius * Math.max(scale.x, scale.z);
        this._pxGeometry.halfHeight = this._halfHeight * scale.y;
        break;
      case ColliderShapeUpAxis.Z:
        this._pxGeometry.radius = this._radius * Math.max(scale.x, scale.y);
        this._pxGeometry.halfHeight = this._halfHeight * scale.z;
        break;
    }
    this._pxShape.setGeometry(this._pxGeometry);
    this._syncCapsuleGeometry();
  }

  private _syncCapsuleGeometry() {
    if (this._entity) {
      const radius = this._pxGeometry.radius;
      const halfHeight = this._pxGeometry.halfHeight;
      this._renderer.mesh = WireFramePrimitive.createCapsuleWireFrame(
        PhysXPhysicsDebug._engine,
        radius,
        halfHeight * 2
      );
    }
  }
}

/**
 * The up axis of the collider shape.
 */
enum ColliderShapeUpAxis {
  /** Up axis is X. */
  X,
  /** Up axis is Y. */
  Y,
  /** Up axis is Z. */
  Z
}
