import { EventBus, Subscribe } from "events/EventBus";
import { FishModel } from "model/FishModel";
import { Vec2 } from "types/Types";
import { TweenPool } from "utils/Tween";
import { degreeToRadians, rotatePointAround } from "utils/Utils";
import { BaseState } from "./BaseState";
import { FishState, FishStateMachine } from "./FishStateMachine";

export class FishRotationState extends BaseState<FishStateMachine, FishState> {
  private onFishPokeSubscribe: Subscribe;

  public execute(): void {
    const { fishNavigationModel } = FishModel.getModel(this.stateMachine.getFishId());

    if (fishNavigationModel.isFishOutsideScreenBounds()) {
      this.stateMachine.setState("moveForwardState");
      return;
    }

    const { center, angle, radius } = fishNavigationModel.getRandomRotationAngle();

    fishNavigationModel.setTurnDirection(angle < 0 ? -1 : 1);

    const pos: Vec2 = fishNavigationModel.getCurrentPosition();
    const currentAngle = fishNavigationModel.getCurrentRotation();

    const distance = Math.abs(radius * degreeToRadians(angle));
    const duration = fishNavigationModel.getMoveDuration(distance);

    const tween = TweenPool.getTween(duration, t => {
      const rotation = degreeToRadians(t * angle);
      const newPos = rotatePointAround(pos, center, rotation);
      fishNavigationModel.setCurrentPosition(...newPos);
      fishNavigationModel.setCurrentRotation(currentAngle + rotation);
    });

    tween.start().then(() => {
      TweenPool.returnTween(tween);
      this.stateMachine.setState("moveForwardState");
    });

    this.onFishPokeSubscribe = EventBus.subscribe("onFishPoke", fishId => {
      if (fishId === this.stateMachine.getFishId() && !fishNavigationModel.isRush()) {
        fishNavigationModel.setRush(true);
        fishNavigationModel.setRandomSpeed();
        tween.stop();
      }
    });
  }

  public cleanUp(): void {
    this.onFishPokeSubscribe.unsubscribe();
  }
}
