export class Timer {
    // Holds the ID for the requestAnimationFrame, which can be used to stop the timer.
    private requestAnimationFrameId!: number;
  
    // Callback function to be executed on each frame with the time delta as its parameter.
    private onEnterFrame: (delta: number) => void;
  
    // Stores the timestamp of the previous frame for calculating delta time.
    private oldTime: number;
  
    /**
     * Creates an instance of the Timer class.
     * @param {(delta: number) => void} cb - The callback function to execute on each frame.
     * @param {any} [context] - Optional context to bind the callback function.
     */
    constructor(cb: (delta: number) => void, context?: any) {
      // Bind the callback function to the provided context if one is specified.
      this.onEnterFrame = context ? cb.bind(context) : cb;
  
      // Initialize the old time with the current timestamp.
      this.oldTime = Date.now();
  
      return this;
    }
  
    /**
     * Starts the timer by initializing the old time and requesting the first animation frame.
     */
    public start(): void {
      this.oldTime = Date.now(); // Reset the time reference point.
      this.onRequestAnimationFrame(); // Start the animation frame loop.
    }
  
    /**
     * Stops the timer by canceling the ongoing requestAnimationFrame loop.
     */
    public stop(): void {
      cancelAnimationFrame(this.requestAnimationFrameId);
    }
  
    /**
     * Internal method called recursively on each animation frame.
     * Calculates the time delta, updates the old time, and executes the callback function.
     */
    private onRequestAnimationFrame(): void {
      // Calculate the time delta in milliseconds since the last frame.
      const delta = Date.now() - this.oldTime;
  
      // Request the next frame and store its ID for potential cancellation.
      this.requestAnimationFrameId = requestAnimationFrame(this.onRequestAnimationFrame.bind(this));
  
      // Update the old time by adding the delta.
      this.oldTime += delta;
  
      // Execute the callback with the time delta converted to seconds.
      this.onEnterFrame(delta / 1000);
    }
  }
  