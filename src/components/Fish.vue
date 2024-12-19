<template>
  <svg>
    <polyline
      :points="skinPoints"
      :fill="fishColor"
      :transform="`translate(${fishPos[0]} ${fishPos[1]}) rotate(${rotationDeg - 90})`"
      @pointerover="onOver"
    />
  </svg>
</template>

<script lang="ts">
import { Bone } from "components/Bone";
import { EventBus } from "events/EventBus";
import { FishNavigationModel, TurnDirection } from "model/FishNavigationModel";
import { FishViewModel } from "model/FishViewModel";
import { FishState } from "states/FishStates";
import { idleStateHandler } from "states/idleState";
import { moveForwardStateHandler } from "states/moveForwardState";
import { rotationStateHandler } from "states/rotationState";
import { Vec2 } from "types/types";
import {
  angleBetweenTwoPoints,
  degreeToRadians,
  distanceBetweenTwoPoints,
  getColorStr,
  lerp,
  radiansToDegree,
  smoothInterpolate,
  smoothInterpolateVec2
} from "utils/mathUtils";
import { states } from "utils/promiseUtils";
import { Timer } from "utils/Timer";
import { onMounted, Ref, ref } from "vue";

export default {
  name: "Fish",
  props: {
    fishId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const fishPos: Ref<Vec2> = ref([0, 0]);
    const rotationDeg: Ref<number> = ref(0);
    const skinPoints: Ref<string> = ref("");

    const fishColor = getColorStr(FishViewModel.getFishColor(props.fishId));
    const fishNavigationModel: Ref<FishNavigationModel> = ref(null);

    const moveDecay: Ref<number> = ref(0);
    moveDecay.value = FishViewModel.getMoveDecay();

    const totalSpineBones = FishViewModel.totalSpineBones;

    let tailSwingSpineRootBoneRotation: number = 0;
    let tailSwingSpineRotations: number[] = new Array(totalSpineBones).fill(0);

    const spineTurnPoseBonesAngle = FishViewModel.spineTurnPoseBonesAngle;
    let rightTurnSpineRotations = new Array(totalSpineBones).fill(-spineTurnPoseBonesAngle);
    let leftTurnSpineRotations = new Array(totalSpineBones).fill(spineTurnPoseBonesAngle);
    let spineBlendRotations = rightTurnSpineRotations;

    let spineBones: Bone[] = [];
    let skinBones: Bone[] = [];

    let currentSpineBlend: number = 0;
    let gotoSpineBlend: number = 0;

    let currentTailSpeed: Ref<number> = ref(0);
    let gotoTailSpeed: Ref<number> = ref(0);

    function onTurnDirectionChange(turnDirection: TurnDirection): void {
      if (turnDirection === 0) {
        gotoSpineBlend = 0;
        return;
      }
      spineBlendRotations = turnDirection === 1 ? rightTurnSpineRotations : leftTurnSpineRotations;
      gotoSpineBlend = 1;
    }

    function drawSkin() {
      skinPoints.value = skinBones.map(bone => [bone.transform.global.x, bone.transform.global.y]).join(",");
    }

    function setRandomTailSpeed(): void {
      const { startSpeed, endSpeed } = FishViewModel.getRandomTailSpeed(fishNavigationModel.value.isRush());
      currentTailSpeed.value = startSpeed;
      gotoTailSpeed.value = endSpeed;
    }

    function createBones(): void {
      let prvScale = 0;
      const totalSpineBones = FishViewModel.totalSpineBones;
      for (let i = 0; i <= totalSpineBones; i++) {
        const scale = FishViewModel.getSpineBoneScale(i);
        const segmentScale = scale - prvScale;
        prvScale = scale;
        const offsetX = (1 - scale) * FishViewModel.fishWidth * 0.5;
        const offsetY = segmentScale * FishViewModel.fishHeight;
        const bone = new Bone(0, -offsetY, spineBones[i - 1]);
        if (i < totalSpineBones) {
          skinBones.push(new Bone(offsetX, 0, bone));
          skinBones.unshift(new Bone(-offsetX, 0, bone));
        } else {
          skinBones.unshift(bone);
        }
        spineBones.push(bone);
      }
    }

    const onEnterFrame = (dt: number) => {
      const gotoPos = fishNavigationModel.value.getCurrentPosition();
      const currentPos = smoothInterpolateVec2([fishPos.value[0], fishPos.value[1]], gotoPos, moveDecay.value, dt);
      const dist = distanceBetweenTwoPoints(currentPos, gotoPos);
      if (dist > 0.1) {
        rotationDeg.value = radiansToDegree(Math.PI * 0.5 - angleBetweenTwoPoints(currentPos, gotoPos));
      }

      currentTailSpeed.value = smoothInterpolate(
        currentTailSpeed.value,
        gotoTailSpeed.value,
        FishViewModel.tailSpeedDecay,
        dt
      );
      currentSpineBlend = smoothInterpolate(currentSpineBlend, gotoSpineBlend, FishViewModel.spineBlendDecay, dt);

      updateTailSwingAnimation();
      updateSpineBones(tailSwingSpineRotations, spineBlendRotations, currentSpineBlend);

      fishPos.value = currentPos;

      drawSkin();
    };

    function updateSpineBones(pose1: number[], pose2: number[], blend: number): void {
      for (let i = 0; i < FishViewModel.totalSpineBones; i++) {
        const bone = spineBones[i];
        bone.setRotation(lerp(pose1[i], pose2[i], blend));
        bone.updateGlobalTransform();
        bone.children.forEach(child => {
          child.updateGlobalTransform();
        });
      }
    }

    function updateTailSwingAnimation(): void {
      tailSwingSpineRootBoneRotation = (tailSwingSpineRootBoneRotation + currentTailSpeed.value) % 360;
      for (let i = 0; i < FishViewModel.totalSpineBones; i++) {
        tailSwingSpineRotations[i] =
          Math.sin(degreeToRadians(tailSwingSpineRootBoneRotation - i * FishViewModel.tailSwingFollowOffset)) *
          FishViewModel.tailSwingMaxBend;
      }
    }

    const onOver = () => {
      EventBus.publish("onFishPoke", props.fishId);
    };

    onMounted(() => {
      fishNavigationModel.value = new FishNavigationModel(props.fishId);
      fishPos.value = fishNavigationModel.value.getCurrentPosition();

      setRandomTailSpeed();
      createBones();

      fishNavigationModel.value.onTurnDirectionChangeSignal.add(onTurnDirectionChange);
      states<FishState>({
        async start(next) {
          next("moveForward");
        },
        idle: idleStateHandler({ fishNavigationModel }),
        rotation: rotationStateHandler({ fishNavigationModel, moveDecay }),
        moveForward: moveForwardStateHandler({ fishNavigationModel, currentTailSpeed, gotoTailSpeed })
      });

      new Timer(onEnterFrame).start();
      window.addEventListener("resize", () => {
        EventBus.publish("onFishPoke", props.fishId);
      });
    });

    return {
      fishPos,
      rotationDeg,
      skinPoints,
      fishColor,
      onOver
    };
  }
};
</script>

<style scoped>
.svg {
  position: absolute;
}
</style>
