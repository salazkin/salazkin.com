import { EventBus } from "events/EventBus";
import { FishNavigationModel } from "model/FishNavigationModel";
import { Vec2 } from "types/types";
import { StateHandler, tween } from "utils/promiseUtils";
import { angleBetweenTwoPoints, distanceBetweenTwoPoints, lerpVec2 } from "utils/mathUtils";
import { FishState } from "./FishStates";
import { Ref } from "vue";
import { FishViewModel } from "model/FishViewModel";

export const moveForwardStateHandler = (data: {
  fishNavigationModel: FishNavigationModel;
  currentTailSpeed: Ref<number>;
  gotoTailSpeed: Ref<number>;
}): StateHandler<FishState> => {
  return async (next, exit) => {
    const { fishNavigationModel, currentTailSpeed, gotoTailSpeed } = data;
    fishNavigationModel.setTurnDirection(0);

    const { startSpeed, endSpeed } = FishViewModel.getRandomTailSpeed(fishNavigationModel.isRush());
    currentTailSpeed.value = startSpeed;
    gotoTailSpeed.value = endSpeed;

    const pos: Vec2 = fishNavigationModel.getCurrentPosition();
    let flag = { skip: false };
    let poke = false;

    const subscribe = EventBus.subscribe("onFishPoke", fishId => {
      if (fishId === fishNavigationModel.getFishId() && !fishNavigationModel.isRush()) {
        poke = true;
        fishNavigationModel.setRush(true);
        fishNavigationModel.setRandomSpeed();
        flag.skip = true;
      }
    });

    let gotoPos: Vec2;

    if (fishNavigationModel.isFishOutsideScreenBounds()) {
      gotoPos = fishNavigationModel.getClosestRandomPointOnScreen();
      const newAngle = Math.PI * 0.5 - angleBetweenTwoPoints(pos, gotoPos);
      fishNavigationModel.setCurrentRotation(newAngle);
    } else {
      gotoPos = fishNavigationModel.getRandomForwardPoint();
    }

    const distance = distanceBetweenTwoPoints(pos, gotoPos);
    const duration = fishNavigationModel.getMoveDuration(distance);

    await tween(
      duration,
      t => {
        const newPos = lerpVec2(pos, gotoPos, t);
        fishNavigationModel.setCurrentPosition(...newPos);
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
