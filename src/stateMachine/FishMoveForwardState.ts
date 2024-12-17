import { EventBus, Subscribe } from "events/EventBus";
import { FishModel } from "model/FishModel";
import { Vec2 } from "types/Types";
import { TweenPool } from "utils/Tween";
import { angleBetweenTwoPoints, distanceBetweenTwoPoints, lerpVec2 } from "utils/Utils";
import { BaseState } from "./BaseState";
import { FishState, FishStateMachine } from "./FishStateMachine";

export class FishMoveForwardState extends BaseState<FishStateMachine, FishState> {
  private onFishPokeSubscribe: Subscribe;

  public execute(): void {
    const { fishNavigationModel } = FishModel.getModel(this.stateMachine.getFishId());

    fishNavigationModel.setTurnDirection(0);
    const pos: Vec2 = fishNavigationModel.getCurrentPosition();

    let gotoPos: Vec2;
    let poke = false;
    if (fishNavigationModel.isFishOutsideScreenBounds()) {
      gotoPos = fishNavigationModel.getClosestRandomPointOnScreen();
      const newAngle = Math.PI * 0.5 - angleBetweenTwoPoints(pos, gotoPos);
      fishNavigationModel.setCurrentRotation(newAngle);
    } else {
      gotoPos = fishNavigationModel.getRandomForwardPoint();
    }

    const distance = distanceBetweenTwoPoints(pos, gotoPos);
    const duration = fishNavigationModel.getMoveDuration(distance);

    const tween = TweenPool.getTween(duration, t => {
      const newPos = lerpVec2(pos, gotoPos, t);
      fishNavigationModel.setCurrentPosition(...newPos);
    });

    tween.start().then(() => {
      TweenPool.returnTween(tween);
      this.stateMachine.setState(poke ? "rotationState" : "idleState");
    });

    this.onFishPokeSubscribe = EventBus.subscribe("onFishPoke", fishId => {
      if (fishId === this.stateMachine.getFishId() && !fishNavigationModel.isRush()) {
        poke = true;
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
