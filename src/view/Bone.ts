import { degreeToRadians } from "../utils/Utils";

export class Bone {
  public transform = { local: { x: 0, y: 0, rotation: 0 }, global: { x: 0, y: 0, rotation: 0 } };
  public children: Bone[] = [];

  constructor(x = 0, y = 0, private parent: Bone) {
    this.transform.local.x = x;
    this.transform.local.y = y;

    if (parent) {
      parent.children.push(this);
    }
    return this;
  }

  public setRotation(value: number): void {
    this.transform.local.rotation = degreeToRadians(value);
  }

  public updateGlobalTransform(): void {
    const local = this.transform.local;
    const global = this.transform.global;
    if (this.parent) {
      const parentGlobal = this.parent.transform.global;
      const globalSinAngel = Math.sin(parentGlobal.rotation);
      const globalCosAngel = Math.cos(parentGlobal.rotation);
      const posX = local.x * globalCosAngel - local.y * globalSinAngel;
      const posY = local.x * globalSinAngel + local.y * globalCosAngel;
      global.x = posX + parentGlobal.x;
      global.y = posY + parentGlobal.y;
      global.rotation = local.rotation + parentGlobal.rotation;
    } else {
      global.x = local.x;
      global.y = local.y;
      global.rotation = local.rotation;
    }
  }
}
