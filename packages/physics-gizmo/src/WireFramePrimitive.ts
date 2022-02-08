import { Vector3 } from "oasis-engine";

export class WireFramePrimitive {
  static createCircleWireFrame(
    radius: number,
    vertexBegin: number,
    vertexCount: number,
    axis: number,
    shift: Vector3,
    positions: Vector3[],
    indices: Uint16Array
  ) {
    const countReciprocal = 1.0 / vertexCount;
    for (let i = 0; i < vertexCount; ++i) {
      const v = i * countReciprocal;
      const thetaDelta = v * Math.PI * 2;

      const globalIndex = i + vertexBegin;
      switch (axis) {
        case 0:
          positions[globalIndex] = new Vector3(
            shift.x,
            radius * Math.cos(thetaDelta) + shift.y,
            radius * Math.sin(thetaDelta) + shift.z
          );
          break;
        case 1:
          positions[globalIndex] = new Vector3(
            radius * Math.cos(thetaDelta) + shift.x,
            shift.y,
            radius * Math.sin(thetaDelta) + shift.z
          );
          break;
        case 2:
          positions[globalIndex] = new Vector3(
            radius * Math.cos(thetaDelta) + shift.x,
            radius * Math.sin(thetaDelta) + shift.y,
            shift.z
          );
          break;
      }

      if (i < vertexCount - 1) {
        indices[2 * globalIndex] = globalIndex;
        indices[2 * globalIndex + 1] = globalIndex + 1;
      } else {
        indices[2 * globalIndex] = globalIndex;
        indices[2 * globalIndex + 1] = vertexBegin;
      }
    }
  }
}
