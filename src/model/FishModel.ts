import { FishNavigationModel } from "./FishNavigationModel";
import { FishStateModel } from "./FishStateModel";

type FishModels = {
  fishStateModel: FishStateModel;
  fishNavigationModel: FishNavigationModel;
};

export const FishModel = new (class {
  private models: Partial<FishModels>[] = [];

  public initFish(fishId: number): void {
    this.models[fishId] = {};
    this.models[fishId].fishStateModel = new FishStateModel();
    this.models[fishId].fishNavigationModel = new FishNavigationModel();
  }

  public getModel(fishId: number): FishModels {
    return this.models[fishId] as FishModels;
  }
})();
