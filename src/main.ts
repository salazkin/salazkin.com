import { FishModel } from "model/FishModel";
import { FishViewModel } from "model/FishViewModel";
import { FishStateMachine } from "stateMachine/FishStateMachine";
import { FishView } from "view/FishView";
import { Logo } from "view/Logo";

for (let i = FishViewModel.totalFishCount - 1; i >= 0; i--) {
  FishModel.initFish(i);
  new FishView(i);
  const fishStateMachine = new FishStateMachine(i);
  fishStateMachine.setState("moveForwardState");
}

new Logo();
