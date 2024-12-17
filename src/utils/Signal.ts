/**
 * `Signal` is a class that implements the Observer pattern.
 * It provides a way for objects (observers) to listen for and react to events (signals) in a decoupled way.
 */
export class Signal<T> {
  // A map of regular listeners (slots), grouped by their contexts.
  private slots: Map<unknown, Set<(data: T) => void>> = new Map();
  // A map of one-time listeners, grouped by their contexts.
  private once: Map<unknown, Set<(data: T) => void>> = new Map();

  /**
   * Adds a listener to the signal.
   * @param slot The listener function.
   * @param context The context in which the listener function should be called. Default is the Signal instance.
   */
  public add(slot: (data: T) => void, context?: unknown): void {
    this.addSlot(this.slots, slot, context || this);
  }

  /**
   * Adds a one-time listener to the signal.
   * This listener will be removed automatically after it's called once.
   * @param slot The listener function.
   * @param context The context in which the listener function should be called. Default is the Signal instance.
   */
  public addOnce(slot: (data: T) => void, context?: unknown): void {
    this.addSlot(this.once, slot, context || this);
  }

  /**
   * Adds a listener to a given map.
   * This is a helper function used by `add` and `addOnce`.
   * @param target The map to add the listener to.
   * @param slot The listener function.
   * @param context The context in which the listener function should be called.
   */
  private addSlot(
    target: Map<unknown, Set<(data: T) => void>>,
    slot: (data: T) => void,
    context: unknown = this
  ): void {
    if (!target.has(context)) {
      target.set(context, new Set());
    }
    target.get(context)?.add(slot);
  }

  /**
   * Removes a listener from the signal.
   * @param slot The listener function to remove.
   * @param context The context in which the listener function was added. Default is the Signal instance.
   */
  public remove(slot: (data: T) => void, context?: unknown): void {
    this.removeSlot(this.slots, slot, context || this);
    this.removeSlot(this.once, slot, context || this);
  }

  /**
   * Removes a listener from a given map.
   * This is a helper function used by `remove`.
   * @param target The map to remove the listener from.
   * @param slot The listener function to remove.
   * @param context The context in which the listener function was added.
   */
  private removeSlot(
    target: Map<unknown, Set<(data: T) => void>>,
    slot: (data: T) => void,
    context: unknown = this
  ): void {
    const slotSet = target.get(context);
    if (slotSet) {
      slotSet.delete(slot);
      if (slotSet.size === 0) {
        target.delete(context);
      }
    }
  }

  /**
   * Removes all listeners from the signal.
   */
  public removeAll(): void {
    this.slots.clear();
    this.once.clear();
  }

  /**
   * Triggers the signal, causing all listeners to be called with the provided data.
   * @param data The data to be passed to the listeners.
   */
  public dispatch(data: T): void {
    this.slots.forEach((arr, key) => {
      arr.forEach(slot => {
        slot.call(key, data);
      });
    });
    this.once.forEach((arr, key) => {
      arr.forEach(slot => {
        slot.call(key, data);
      });
    });
    this.once.clear();
  }

  /**
   * Checks if signal has any listeners.
   */
  public isEmpty(): boolean {
    return this.slots.size === 0 && this.once.size === 0;
  }
}