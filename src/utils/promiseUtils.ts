/**
 * A handler function for managing state transitions.
 * @template State - The type representing the state.
 * @param {(state: State) => void} next - A function to transition to the next state.
 * @param {() => void} exit - A function to exit the state machine.
 * @returns {Promise<void> | void} A promise or void indicating the completion of the state handling.
 */
export type StateHandler<State extends string> = (
  next: (state: State) => void,
  exit: () => void
) => Promise<void> | void;

/**
 * Configuration object for the state machine.
 * @template State - The type representing the state.
 * @property {StateHandler<State>} start - The handler for the start state.
 * @property {Object<string, StateHandler<State>>} [K in State] - A handler for each state.
 */
type StateConfig<State extends string> = {
  start: StateHandler<State>;
} & {
  [K in State]: StateHandler<State>;
};

/**
 * Runs a state machine based on the provided configuration.
 * @template State - The type representing the state.
 * @param {StateConfig<State>} config - The configuration for the state machine.
 * @returns {Promise<void>} A promise that resolves when the state machine exits.
 */
export async function states<State extends string>(config: StateConfig<State>): Promise<void> {
  return new Promise<void>(resolve => {
    const exit = () => {
      resolve();
    };

    const next = (state: State) => {
      processState(state);
    };

    const processState = async (state: State) => {
      const stateHandler = config[state];
      if (!stateHandler) {
        throw new Error(`State "${state}" is not defined in the configuration`);
      }
      await stateHandler(next, exit);
    };

    processState("start" as State);
  });
}

/**
 * Performs a tween animation over a specified duration.
 * @param {number} duration - The duration of the tween in milliseconds.
 * @param {(t: number, skipped?: boolean) => void} onUpdate - A callback function invoked with the progress (0 to 1) and a skip flag.
 * @param {{ skip: boolean }} [flag] - An optional flag to skip the tween.
 * @returns {Promise<void>} A promise that resolves when the tween is complete or skipped.
 */
export async function tween(
  duration: number,
  onUpdate: (t: number, skipped?: boolean) => void,
  flag?: { skip: boolean }
): Promise<void> {
  const start = performance.now();
  return new Promise<void>(resolve => {
    function step() {
      const now = performance.now();
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      if (flag?.skip) {
        onUpdate(t, true);
        resolve();
        return;
      }
      onUpdate(t);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }
    step();
  });
}

/**
 * Delays execution for a specified duration.
 * @param {number} duration - The duration of the delay in milliseconds.
 * @param {{ skip: boolean }} [flag] - An optional flag to skip the delay.
 * @returns {Promise<void>} A promise that resolves when the delay is complete or skipped.
 */
export async function delay(duration: number, flag?: { skip: boolean }): Promise<void> {
  const start = performance.now();
  return new Promise<void>(resolve => {
    function step() {
      const now = performance.now();
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      if (flag?.skip) {
        resolve();
        return;
      }
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }
    step();
  });
}
