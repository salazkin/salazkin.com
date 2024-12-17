import { FishState } from "stateMachine/FishStateMachine";
import { Signal } from "utils/Signal";

/**
 * FishStateModel manages the current state of a fish.
 */
export class FishStateModel {
  /** Holds the current state of the fish as a unique symbol. */
  private currentFishState: symbol;

  /**
   * A mapping of state identifiers (keys) to unique symbols.
   * Ensures each state ID has a corresponding symbol for consistent comparison.
   */
  private symbols: { [key: string]: symbol } = {};

  /**
   * Signal dispatched whenever the fish's state changes.
   * Provides the new state as a parameter.
   */
  public fishStateChangeSignal: Signal<FishState> = new Signal();

  /**
   * Initializes the FishStateModel with no current state.
   */
  constructor() {
    this.currentFishState = null;
  }

  /**
   * Sets the current state of the fish.
   *
   * @param {FishState} id - The new state to set.
   */
  public setFishState(id: FishState): void {
    if (this.symbols[id] === undefined) {
      this.symbols[id] = Symbol(id);
    }
    this.currentFishState = this.symbols[id];
    this.fishStateChangeSignal.dispatch(id);
  }

  /**
   * Checks if the fish is currently in any of the provided states.
   *
   * @param {FishState[]} rest - A list of states to check.
   * @returns {boolean} True if the fish is in one of the provided states, false otherwise.
   */
  public inAState(...rest: FishState[]): boolean {
    for (let i = 0; i < rest.length; i++) {
      const id = rest[i];
      if (this.symbols[id] === undefined) {
        this.symbols[id] = Symbol(id);
      }
      if (this.currentFishState === this.symbols[id]) {
        return true;
      }
    }
    return false;
  }
}
