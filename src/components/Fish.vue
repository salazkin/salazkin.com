<template>
  <svg xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient :id="`gradient${props.fishId}`" x1="0" y1="0" x2="0" y2="1">
        <stop
          v-for="gradient in fishAlphaGradient"
          :offset="`${gradient.offset * 100}%`"
          :style="`stop-color: ${fishColor}; stop-opacity: ${gradient.alpha};`"
        />
      </linearGradient>
    </defs>

    <polyline
      :points="skinPoints"
      :fill="`url(#gradient${props.fishId})`"
      :transform="`translate(${fishPos[0]} ${fishPos[1]}) rotate(${rotationDeg - 90})`"
      @pointerover="onOver"
    />
  </svg>
</template>

<script setup lang="ts">
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

const props = defineProps<{
  fishId: number;
}>();

const fishPos: Ref<Vec2> = ref([0, 0]);
const rotationDeg: Ref<number> = ref(0);
const skinPoints: Ref<string> = ref();

const fishAlphaGradient: Ref<{ offset: number; alpha: number }[]> = ref(FishViewModel.fishAlphaGradient);
const fishColor: Ref<string> = ref();
const { spineTurnPoseBonesAngle, totalSpineBones } = FishViewModel;

fishColor.value = getColorStr(FishViewModel.getFishColor());

let fishNavigationModel: FishNavigationModel;

const moveDecay: Ref<number> = ref(0);
moveDecay.value = FishViewModel.getRandomMoveDecay();

const tailSwingSpineRootBoneRotation: Ref<number> = ref(0);
const tailSwingSpineRotations: Ref<number[]> = ref(new Array(totalSpineBones).fill(0));

const rightTurnSpineRotations: Ref<number[]> = ref(new Array(totalSpineBones).fill(-spineTurnPoseBonesAngle));
const leftTurnSpineRotations: Ref<number[]> = ref(new Array(totalSpineBones).fill(spineTurnPoseBonesAngle));
let spineBlendRotations: Ref<number[]> = rightTurnSpineRotations;

let spineBones: Ref<Bone[]> = ref([]);
let skinBones: Ref<Bone[]> = ref([]);

const currentSpineBlend: Ref<number> = ref(0);
const gotoSpineBlend: Ref<number> = ref(0);

const currentTailSpeed: Ref<number> = ref(0);
const gotoTailSpeed: Ref<number> = ref(0);

function onTurnDirectionChange(turnDirection: TurnDirection): void {
  if (turnDirection === 0) {
    gotoSpineBlend.value = 0;
    return;
  }
  spineBlendRotations = turnDirection === 1 ? rightTurnSpineRotations : leftTurnSpineRotations;
  gotoSpineBlend.value = 1;
}

function drawSkin() {
  skinPoints.value = skinBones.value.map(bone => [bone.transform.global.x, bone.transform.global.y]).join(",");
}

function setRandomTailSpeed(): void {
  const { startSpeed, endSpeed } = FishViewModel.getRandomTailSpeed(fishNavigationModel.isRush());
  currentTailSpeed.value = startSpeed;
  gotoTailSpeed.value = endSpeed;
}

function createBones(): void {
  let prvScale = 0;
  const { totalSpineBones, fishWidth, fishHeight } = FishViewModel;
  for (let i = 0; i <= totalSpineBones; i++) {
    const scale = FishViewModel.getSpineBoneScale(i);
    const segmentScale = scale - prvScale;
    prvScale = scale;
    const offsetX = (1 - scale) * fishWidth * 0.5;
    const offsetY = segmentScale * fishHeight;
    const bone = new Bone(0, -offsetY, spineBones.value[i - 1]);
    if (i < totalSpineBones) {
      skinBones.value.push(new Bone(offsetX, 0, bone));
      skinBones.value.unshift(new Bone(-offsetX, 0, bone));
    } else {
      skinBones.value.unshift(bone);
    }
    spineBones.value.push(bone);
  }
}

const onEnterFrame = (dt: number) => {
  const gotoPos = fishNavigationModel.getCurrentPosition();
  const currentPos = smoothInterpolateVec2([fishPos.value[0], fishPos.value[1]], gotoPos, moveDecay.value, dt);
  const dist = distanceBetweenTwoPoints(currentPos, gotoPos);
  if (dist > 0.1) {
    rotationDeg.value = radiansToDegree(Math.PI * 0.5 - angleBetweenTwoPoints(currentPos, gotoPos));
  }
  const { tailSpeedDecay, spineBlendDecay } = FishViewModel;
  currentTailSpeed.value = smoothInterpolate(currentTailSpeed.value, gotoTailSpeed.value, tailSpeedDecay, dt);
  currentSpineBlend.value = smoothInterpolate(currentSpineBlend.value, gotoSpineBlend.value, spineBlendDecay, dt);

  updateTailSwingAnimation();
  updateSpineBones(tailSwingSpineRotations.value, spineBlendRotations.value, currentSpineBlend.value);

  fishPos.value = currentPos;

  drawSkin();
};

function updateSpineBones(pose1: number[], pose2: number[], blend: number): void {
  const { totalSpineBones } = FishViewModel;
  for (let i = 0; i < totalSpineBones; i++) {
    const bone = spineBones.value[i];
    bone.setRotation(lerp(pose1[i], pose2[i], blend));
    bone.updateGlobalTransform();
    bone.children.forEach(child => {
      child.updateGlobalTransform();
    });
  }
}

function updateTailSwingAnimation(): void {
  tailSwingSpineRootBoneRotation.value = (tailSwingSpineRootBoneRotation.value + currentTailSpeed.value) % 360;
  const { totalSpineBones, tailSwingFollowOffset, tailSwingMaxBend } = FishViewModel;
  for (let i = 0; i < totalSpineBones; i++) {
    tailSwingSpineRotations.value[i] =
      Math.sin(degreeToRadians(tailSwingSpineRootBoneRotation.value - i * tailSwingFollowOffset)) * tailSwingMaxBend;
  }
}

const onOver = () => {
  EventBus.publish("onFishPoke", props.fishId);
};

onMounted(() => {
  fishNavigationModel = new FishNavigationModel(props.fishId);
  fishPos.value = fishNavigationModel.getCurrentPosition();

  setRandomTailSpeed();
  createBones();

  fishNavigationModel.onTurnDirectionChangeSignal.add(onTurnDirectionChange);
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
</script>

<style scoped>
.svg {
  position: absolute;
}
</style>
