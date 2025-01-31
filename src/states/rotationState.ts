import { EventBus } from "events/EventBus";
import { FishNavigationModel } from "model/FishNavigationModel";
import { FishViewModel } from "model/FishViewModel";
import { Vec2 } from "types/types";
import { degreeToRadians, rotatePointAround } from "utils/mathUtils";
import { Ref } from "vue";
import { FishState } from "./FishStates";
import { StateHandler, tween } from "@salazkin/promise-utils";

export const rotationStateHandler = (data: {
  fishNavigationModel: FishNavigationModel;
  moveDecay: Ref<number>;
}): StateHandler<FishState> => {
  return async (next, exit) => {
    const { fishNavigationModel, moveDecay } = data;

    moveDecay.value = FishViewModel.getRandomMoveDecay();
    if (fishNavigationModel.isFishOutsideScreenBounds()) {
      next("moveForward");
      return;
    }

    const subscribe = EventBus.subscribe("onFishPoke", fishId => {
      if (fishId === fishNavigationModel.getFishId() && !fishNavigationModel.isRush()) {
        fishNavigationModel.setRush(true);
        fishNavigationModel.setRandomSpeed();
        flag.skip = true;
      }
    });

    const cleanUp = () => {
      subscribe.unsubscribe();
      return { next, exit };
    };

    let flag = { skip: false };

    const { center, angle, radius } = fishNavigationModel.getRandomRotationAngle();

    fishNavigationModel.setTurnDirection(angle < 0 ? -1 : 1);

    const pos: Vec2 = fishNavigationModel.getCurrentPosition();
    const currentAngle = fishNavigationModel.getCurrentRotation();

    const distance = Math.abs(radius * degreeToRadians(angle));
    const duration = fishNavigationModel.getMoveDuration(distance);

    await tween(
      duration,
      t => {
        const rotation = degreeToRadians(t * angle);
        const newPos = rotatePointAround(pos, center, rotation);
        fishNavigationModel.setCurrentPosition(...newPos);
        fishNavigationModel.setCurrentRotation(currentAngle + rotation);
      },
      flag
    );
    cleanUp().next("moveForward");
  };
};
