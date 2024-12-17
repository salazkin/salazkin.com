import { EventBus, Subscribe } from "events/EventBus";
import { FishModel } from "model/FishModel";
import { BaseState } from "./BaseState";
import { FishState, FishStateMachine } from "./FishStateMachine";

export class FishIdleState extends BaseState<FishStateMachine, FishState> {
  private idleTimeout: number;
  private onFishPokeSubscribe: Subscribe;

  public execute(): void {
    const { fishNavigationModel } = FishModel.getModel(this.stateMachine.getFishId());
    fishNavigationModel.setTurnDirection(0);
    this.idleTimeout = setTimeout(() => {
      fishNavigationModel.setRandomRush();
      fishNavigationModel.setRandomSpeed();
      this.stateMachine.setState("rotationState");
    }, fishNavigationModel.getRandomIdleDelay());

    this.onFishPokeSubscribe = EventBus.subscribe("onFishPoke", fishId => {
      if (fishId === this.stateMachine.getFishId()) {
        clearTimeout(this.idleTimeout);
        fishNavigationModel.setRush(true);
        fishNavigationModel.setRandomSpeed();
        this.stateMachine.setState("rotationState");
      }
    });
  }

  public cleanUp(): void {
    this.onFishPokeSubscribe.unsubscribe();
  }
}
