import { Signal } from "utils/Signal";
import { BaseState } from "./BaseState";

export class BaseStateMachine<T extends string> {
  protected currentState: BaseState<BaseStateMachine<T>, T> = null;
  protected idsArr: { [key: string]: number } = {};
  protected statesArr: { [key: string]: BaseState<BaseStateMachine<T>, T> } = {};
  protected stateChangeSignal: Signal<T> = new Signal();

  protected addState(
    Class: new (stateMachine: BaseStateMachine<T>, id: T) => BaseState<BaseStateMachine<T>, T>,
    id: T
  ): void {
    if (this.idsArr[id]) {
      throw new Error(`State already defined: ${id}`);
    } else {
      this.idsArr[id] = Object.keys(this.idsArr).length;
      this.statesArr[id] = new Class(this, id);
    }
  }
  public setState(id: T): void {
    if (this.currentState) {
      this.currentState.cleanUp();
    }
    this.currentState = this.statesArr[id];
    this.stateChangeSignal.dispatch(this.currentState.id);
    this.currentState.execute();
  }
}
