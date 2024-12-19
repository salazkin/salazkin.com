import { delay, StateHandler } from "utils/promiseUtils";
import { FishState } from "./FishStates";
import { EventBus } from "events/EventBus";
import { FishNavigationModel } from "model/FishNavigationModel";
import { Ref } from "vue";

export const idleStateHandler = (data: { fishNavigationModel: Ref<FishNavigationModel> }): StateHandler<FishState> => {
  return async (next, exit) => {
    const { fishNavigationModel } = data;
    fishNavigationModel.value.setTurnDirection(0);

    const flag = { skip: false };
    const subscribe = EventBus.subscribe("onFishPoke", fishId => {
      if (fishId !== fishNavigationModel.value.getFishId()) {
        return;
      }
      flag.skip = true;
    });

    const cleanUp = () => {
      subscribe.unsubscribe();
      return { next, exit };
    };

    await delay(fishNavigationModel.value.getRandomIdleDelay(), flag);
    if (flag.skip) {
      fishNavigationModel.value.setRush(true);
    } else {
      fishNavigationModel.value.setRandomRush();
    }
    fishNavigationModel.value.setRandomSpeed();
    cleanUp().next("rotation");
  };
};
