import { EventBus } from "events/EventBus";
import { FishNavigationModel } from "model/FishNavigationModel";
import { Vec2 } from "types/types";
import { StateHandler, tween } from "utils/promiseUtils";
import { angleBetweenTwoPoints, distanceBetweenTwoPoints, lerpVec2 } from "utils/mathUtils";
import { FishState } from "./FishStates";
import { Ref } from "vue";
import { FishViewModel } from "model/FishViewModel";

export const moveForwardStateHandler = (data: {
  fishNavigationModel: Ref<FishNavigationModel>;
  currentTailSpeed: Ref<number>;
  gotoTailSpeed: Ref<number>;
}): StateHandler<FishState> => {
  return async (next, exit) => {
    const { fishNavigationModel, currentTailSpeed, gotoTailSpeed } = data;
    fishNavigationModel.value.setTurnDirection(0);

    const { startSpeed, endSpeed } = FishViewModel.getRandomTailSpeed(fishNavigationModel.value.isRush());
    currentTailSpeed.value = startSpeed;
    gotoTailSpeed.value = endSpeed;

    const pos: Vec2 = fishNavigationModel.value.getCurrentPosition();
    let flag = { skip: false };
    let poke = false;

    const subscribe = EventBus.subscribe("onFishPoke", fishId => {
      if (fishId === fishNavigationModel.value.getFishId() && !fishNavigationModel.value.isRush()) {
        poke = true;
        fishNavigationModel.value.setRush(true);
        fishNavigationModel.value.setRandomSpeed();
        flag.skip = true;
      }
    });

    let gotoPos: Vec2;

    if (fishNavigationModel.value.isFishOutsideScreenBounds()) {
      gotoPos = fishNavigationModel.value.getClosestRandomPointOnScreen();
      const newAngle = Math.PI * 0.5 - angleBetweenTwoPoints(pos, gotoPos);
      fishNavigationModel.value.setCurrentRotation(newAngle);
    } else {
      gotoPos = fishNavigationModel.value.getRandomForwardPoint();
    }

    const distance = distanceBetweenTwoPoints(pos, gotoPos);
    const duration = fishNavigationModel.value.getMoveDuration(distance);

    await tween(
      duration,
      t => {
        const newPos = lerpVec2(pos, gotoPos, t);
        fishNavigationModel.value.setCurrentPosition(...newPos);
      },
      flag
    );

    const cleanUp = () => {
      subscribe.unsubscribe();
      return { next, exit };
    };

    cleanUp().next(poke ? "rotation" : "idle");
  };
};
