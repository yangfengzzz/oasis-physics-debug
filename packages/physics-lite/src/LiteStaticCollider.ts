import { IStaticCollider } from "@oasis-engine/design";
import { LiteCollider } from "./LiteCollider";
import { Quaternion, Vector3 } from "oasis-engine";

/**
 * A static collider component that will not move.
 * @remarks Mostly used for object which always stays at the same place and never moves around.
 */
export class LiteStaticCollider extends LiteCollider implements IStaticCollider {
  /**
   * Initialize static actor.
   * @param position - The global position
   * @param rotation - The global rotation
   */
  constructor(position: Vector3, rotation: Quaternion) {
    super();
    this._transform.setPosition(position.x, position.y, position.z);
    this._transform.setRotationQuaternion(rotation.x, rotation.y, rotation.z, rotation.w);
  }
}
