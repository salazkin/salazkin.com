import { BaseStateMachine } from "./BaseStateMachine";
export abstract class BaseState<S extends BaseStateMachine<T>, T extends string> {
  public id: T;
  protected stateMachine: S;

  constructor(stateMachine: S, id: T) {
    this.stateMachine = stateMachine;
    this.id = id;
  }

  public execute(): void {}
  public cleanUp(): void {}
}
