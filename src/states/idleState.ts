import { delay, StateHandler } from "utils/promiseUtils";
import { FishState } from "./FishStates";
import { EventBus } from "events/EventBus";
import { FishNavigationModel } from "model/FishNavigationModel";
import { Ref } from "vue";

export const idleStateHandler = (data: { fishNavigationModel: FishNavigationModel }): StateHandler<FishState> => {
  return async (next, exit) => {
    const { fishNavigationModel } = data;
    fishNavigationModel.setTurnDirection(0);

    const flag = { skip: false };
    const subscribe = EventBus.subscribe("onFishPoke", fishId => {
      if (fishId !== fishNavigationModel.getFishId()) {
        return;
      }
      flag.skip = true;
    });

    const cleanUp = () => {
      subscribe.unsubscribe();
      return { next, exit };
    };

    await delay(fishNavigationModel.getRandomIdleDelay(), flag);
    if (flag.skip) {
      fishNavigationModel.setRush(true);
    } else {
      fishNavigationModel.setRandomRush();
    }
    fishNavigationModel.setRandomSpeed();
    cleanUp().next("rotation");
  };
};
