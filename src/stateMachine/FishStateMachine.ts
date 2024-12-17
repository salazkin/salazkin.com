import { FishModel } from "model/FishModel";
import { BaseStateMachine } from "./BaseStateMachine";
import { FishIdleState } from "./FishIdleState";
import { FishMoveForwardState } from "./FishMoveForwardState";
import { FishRotationState } from "./FishRotationState";

export type FishState = `${"idle" | "moveForward" | "rotation"}State`;

export class FishStateMachine extends BaseStateMachine<FishState> {
  constructor(private fishId: number) {
    super();
    this.addState(FishIdleState, "idleState");
    this.addState(FishRotationState, "rotationState");
    this.addState(FishMoveForwardState, "moveForwardState");

    const { fishStateModel } = FishModel.getModel(fishId);

    this.stateChangeSignal.add(id => {
      fishStateModel.setFishState(id);
    });
  }

  public getFishId(): number {
    return this.fishId;
  }
}
