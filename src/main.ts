import { ContainerDiv } from "components/ContainerDiv";
import { FishModel } from "model/FishModel";
import { FishViewModel } from "model/FishViewModel";
import { FishStateMachine } from "stateMachine/FishStateMachine";
import { FishView } from "view/FishView";
import { Logo } from "view/Logo";

const container = new ContainerDiv();
document.getElementById("app").appendChild(container.getRootDiv());

for (let i = FishViewModel.totalFishCount - 1; i >= 0; i--) {
  FishModel.initFish(i);
  container.addChild(new FishView(i));
  const fishStateMachine = new FishStateMachine(i);
  fishStateMachine.setState("moveForwardState");
}

container.addChild(new Logo());
