import { EventBus } from "events/EventBus";
import { FishNavigationModel } from "model/FishNavigationModel";
import { FishViewModel } from "model/FishViewModel";
import { Vec2 } from "types/types";
import { StateHandler, tween } from "utils/promiseUtils";
import { degreeToRadians, rotatePointAround } from "utils/mathUtils";
import { Ref } from "vue";
import { FishState } from "./FishStates";

export const rotationStateHandler = (data: {
  fishNavigationModel: Ref<FishNavigationModel>;
  moveDecay: Ref<number>;
}): StateHandler<FishState> => {
  return async (next, exit) => {
    const { fishNavigationModel, moveDecay } = data;

    moveDecay.value = FishViewModel.getMoveDecay();
    if (fishNavigationModel.value.isFishOutsideScreenBounds()) {
      next("moveForward");
      return;
    }

    const subscribe = EventBus.subscribe("onFishPoke", fishId => {
      if (fishId === fishNavigationModel.value.getFishId() && !fishNavigationModel.value.isRush()) {
        fishNavigationModel.value.setRush(true);
        fishNavigationModel.value.setRandomSpeed();
        flag.skip = true;
      }
    });

    const cleanUp = () => {
      subscribe.unsubscribe();
      return { next, exit };
    };

    let flag = { skip: false };

    const { center, angle, radius } = fishNavigationModel.value.getRandomRotationAngle();

    fishNavigationModel.value.setTurnDirection(angle < 0 ? -1 : 1);

    const pos: Vec2 = fishNavigationModel.value.getCurrentPosition();
    const currentAngle = fishNavigationModel.value.getCurrentRotation();

    const distance = Math.abs(radius * degreeToRadians(angle));
    const duration = fishNavigationModel.value.getMoveDuration(distance);

    await tween(
      duration,
      t => {
        const rotation = degreeToRadians(t * angle);
        const newPos = rotatePointAround(pos, center, rotation);
        fishNavigationModel.value.setCurrentPosition(...newPos);
        fishNavigationModel.value.setCurrentRotation(currentAngle + rotation);
      },
      flag
    );
    cleanUp().next("moveForward");
  };
};
