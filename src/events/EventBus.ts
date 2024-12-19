import { Signal } from "utils/Signal";

export type Subscribe = {
  unsubscribe: () => void;
};

/**
 * EventBus is a static class that manages event publishing and subscription.
 */
export class EventBus {
  /**
   * A private object to store signals for different events.
   * The keys represent event names, and the values are Signal instances.
   */
  private static signals: { [key: string]: Signal<any> | undefined } = {};

  /**
   * Publishes an event by dispatching it to all subscribed listeners.
   * @param {K} event - The name of the event to publish.
   * @param {Events[K]} params - The data to pass to the event listeners.
   */
  public static publish<K extends keyof Events>(event: K, params: Events[K]): void {
    this.signals[event]?.dispatch(params);
  }

  /**
   * Subscribes to an event, allowing the callback to be invoked whenever the event is published.
   * @param {K} event - The name of the event to subscribe to.
   * @param {(data: Events[K]) => void} cb - The callback function to execute when the event is dispatched.
   * @param {any} [context] - Optional context to bind the callback to.
   * @returns {Subscribe} - An object with an `unsubscribe` method to remove the listener.
   */
  public static subscribe<K extends keyof Events>(event: K, cb: (data: Events[K]) => void, context?: any): Subscribe {
    let signal = this.signals[event];
    if (!signal) {
      signal = new Signal<Events[K]>();
      this.signals[event] = signal;
    }
    signal.add(cb, context);
    return {
      unsubscribe: () => {
        signal?.remove(cb, context);
        this.cleanupSignal(event);
      }
    };
  }

  /**
   * Subscribes to an event but ensures the callback is executed only once.
   * @param {K} event - The name of the event to subscribe to.
   * @param {(data: Events[K]) => void} cb - The callback function to execute when the event is dispatched.
   * @param {any} [context] - Optional context to bind the callback to.
   * @returns {Subscribe} - An object with an `unsubscribe` method to remove the listener.
   */
  public static subscribeOnce<K extends keyof Events>(
    event: K,
    cb: (data: Events[K]) => void,
    context?: any
  ): Subscribe {
    let signal = this.signals[event];
    if (!signal) {
      signal = new Signal<Events[K]>();
      this.signals[event] = signal;
    }
    signal.addOnce(cb, context);
    return {
      unsubscribe: () => {
        signal?.remove(cb, context);
        this.cleanupSignal(event);
      }
    };
  }

  /**
   * Cleans up unused signals by removing them if they no longer have any listeners.
   * @param {K} event - The name of the event whose signal needs cleanup.
   */
  private static cleanupSignal<K extends keyof Events>(event: K): void {
    const signal = this.signals[event];
    if (signal && signal.isEmpty()) {
      delete this.signals[event];
    }
  }
}
