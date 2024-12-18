import { EventBus } from "events/EventBus";
import { FishModel } from "model/FishModel";
import { FishNavigationModel, TurnDirection } from "model/FishNavigationModel";
import { FishStateModel } from "model/FishStateModel";
import { FishViewModel } from "model/FishViewModel";
import { FishState } from "stateMachine/FishStateMachine";
import { Vec2 } from "types/Types";
import { Timer } from "utils/Timer";
import {
  angleBetweenTwoPoints,
  degreeToRadians,
  distanceBetweenTwoPoints,
  getColorStr,
  lerp,
  radiansToDegree,
  smoothInterpolate,
  smoothInterpolateVec2
} from "utils/Utils";
import { Bone } from "./Bone";

export class FishView {
  private svg: HTMLElement;
  private shape: SVGPolylineElement;

  private fishStateModel: FishStateModel;

  private fishNavigationModel: FishNavigationModel;
  private timer: Timer;
  private gotoPos: Vec2 = [0, 0];
  private currentPos: Vec2 = [0, 0];
  private currentRotation: number = 0;

  private moveDecay: number;

  private tailSwingSpineRootBoneRotation: number = 0;
  private tailSwingSpineRotations: number[];
  private leftTurnSpineRotations: number[];
  private rightTurnSpineRotations: number[];

  private spineBones: Bone[] = [];
  private skinBones: Bone[] = [];

  private currentSpineBlend: number = 0;
  private gotoSpineBlend: number = 0;

  private currentTailSpeed: number;
  private gotoTailSpeed: number;

  private spineBlendRotations: number[];
  private skinPoints: number[] = [];

  constructor(private fishId: number) {
    this.svg = document.getElementById("main-svg");

    this.shape = this.createFishShape(getColorStr(FishViewModel.getFishColor(fishId)));
    this.shape.addEventListener("pointerover", this.onOver);
    this.svg.appendChild(this.shape);
 
    const { fishStateModel, fishNavigationModel } = FishModel.getModel(fishId);

    this.fishStateModel = fishStateModel;
    this.fishStateModel.fishStateChangeSignal.add(this.onStateChange, this);

    this.fishNavigationModel = fishNavigationModel;

    this.currentPos = fishNavigationModel.getCurrentPosition();
    this.currentRotation = fishNavigationModel.getCurrentRotation();
    this.moveDecay = FishViewModel.getMoveDecay();

    window.addEventListener("resize", this.onResize);

    this.setRandomTailSpeed();

    this.createBones();

    const totalSpineBones = FishViewModel.totalSpineBones;
    this.tailSwingSpineRotations = new Array(totalSpineBones).fill(0);
    const spineTurnPoseBonesAngle = FishViewModel.spineTurnPoseBonesAngle;
    this.rightTurnSpineRotations = new Array(totalSpineBones).fill(-spineTurnPoseBonesAngle);
    this.leftTurnSpineRotations = new Array(totalSpineBones).fill(spineTurnPoseBonesAngle);
    this.spineBlendRotations = this.rightTurnSpineRotations;

    this.timer = new Timer(this.onEnterFrame, this);
    this.timer.start();

    fishNavigationModel.onTurnDirectionChangeSignal.add(this.onTurnDirectionChange, this);
  }

  private onResize = () => {
    EventBus.publish("onFishPoke", this.fishId);
  };

  private onEnterFrame(dt: number): void {
    this.gotoPos = this.fishNavigationModel.getCurrentPosition();
    this.currentPos = smoothInterpolateVec2(this.currentPos, this.gotoPos, this.moveDecay, dt);
    const dist = distanceBetweenTwoPoints(this.currentPos, this.gotoPos);
    if (dist > 0.1) {
      this.currentRotation = Math.PI * 0.5 - angleBetweenTwoPoints(this.currentPos, this.gotoPos);
    }

    this.currentTailSpeed = smoothInterpolate(
      this.currentTailSpeed,
      this.gotoTailSpeed,
      FishViewModel.tailSpeedDecay,
      dt
    );
    this.currentSpineBlend = smoothInterpolate(
      this.currentSpineBlend,
      this.gotoSpineBlend,
      FishViewModel.spineBlendDecay,
      dt
    );

    this.updateTailSwingAnimation();
    this.updateSpineBones(this.tailSwingSpineRotations, this.spineBlendRotations, this.currentSpineBlend);
    this.drawSkin();
  }

  private drawSkin(): void {
    this.skinPoints.length = 0;
    this.skinBones.forEach(bone => {
      this.skinPoints.push(bone.transform.global.x, bone.transform.global.y);
    });
    const [x, y] = this.currentPos;
    this.shape.setAttributeNS(null, "points", this.skinPoints.join(","));
    this.shape.setAttributeNS(
      null,
      "transform",
      `translate(${x} ${y}) rotate(${radiansToDegree(this.currentRotation) - 90})`
    );
  }

  private updateTailSwingAnimation(): void {
    this.tailSwingSpineRootBoneRotation = (this.tailSwingSpineRootBoneRotation + this.currentTailSpeed) % 360;
    for (let i = 0; i < FishViewModel.totalSpineBones; i++) {
      this.tailSwingSpineRotations[i] =
        Math.sin(degreeToRadians(this.tailSwingSpineRootBoneRotation - i * FishViewModel.tailSwingFollowOffset)) *
        FishViewModel.tailSwingMaxBend;
    }
  }

  private updateSpineBones(pose1: number[], pose2: number[], blend: number): void {
    for (let i = 0; i < FishViewModel.totalSpineBones; i++) {
      const bone = this.spineBones[i];
      bone.setRotation(lerp(pose1[i], pose2[i], blend));
      bone.updateGlobalTransform();
      bone.children.forEach(child => {
        child.updateGlobalTransform();
      });
    }
  }

  private onTurnDirectionChange(turnDirection: TurnDirection): void {
    if (turnDirection === 0) {
      this.gotoSpineBlend = 0;
      return;
    }
    this.spineBlendRotations = turnDirection === 1 ? this.rightTurnSpineRotations : this.leftTurnSpineRotations;
    this.gotoSpineBlend = 1;
  }

  private onOver = (): void => {
    EventBus.publish("onFishPoke", this.fishId);
  };

  private onStateChange(state: FishState): void {
    if (this.fishStateModel.inAState("rotationState")) {
      this.moveDecay = FishViewModel.getMoveDecay();
    }
    if (this.fishStateModel.inAState("moveForwardState")) {
      this.setRandomTailSpeed();
    }
  }

  private setRandomTailSpeed(): void {
    const { startSpeed, endSpeed } = FishViewModel.getRandomTailSpeed(this.fishNavigationModel.isRush());
    this.currentTailSpeed = startSpeed;
    this.gotoTailSpeed = endSpeed;
  }

  private createBones(): void {
    let prvScale = 0;
    const totalSpineBones = FishViewModel.totalSpineBones;
    for (let i = 0; i <= totalSpineBones; i++) {
      const scale = FishViewModel.getSpineBoneScale(i);
      const segmentScale = scale - prvScale;
      prvScale = scale;
      const offsetX = (1 - scale) * FishViewModel.fishWidth * 0.5;
      const offsetY = segmentScale * FishViewModel.fishHeight;
      const bone = new Bone(0, -offsetY, this.spineBones[i - 1]);
      if (i < totalSpineBones) {
        this.skinBones.push(new Bone(offsetX, 0, bone));
        this.skinBones.unshift(new Bone(-offsetX, 0, bone));
      } else {
        this.skinBones.unshift(bone);
      }
      this.spineBones.push(bone);
    }
  }

  private createFishShape(color: string): SVGPolylineElement {
    const shape = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    shape.setAttributeNS(null, "fill", color);
    return shape;
  }
}
