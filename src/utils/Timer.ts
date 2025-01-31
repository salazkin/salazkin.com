export class Timer {
  private requestAnimationFrameId!: number;
  private onEnterFrame: (delta: number) => void;
  private oldTime: number;

  /**
   * Creates an instance of the Timer class.
   * @param {(delta: number) => void} cb - The callback function to execute on each frame.
   * @param {any} [context] - Optional context to bind the callback function.
   */
  constructor(cb: (delta: number) => void, context?: any) {
    this.onEnterFrame = context ? cb.bind(context) : cb;
    this.oldTime = Date.now();
    return this;
  }

  public start(): void {
    this.oldTime = Date.now();
    this.onRequestAnimationFrame();
  }

  public stop(): void {
    cancelAnimationFrame(this.requestAnimationFrameId);
  }

  private onRequestAnimationFrame(): void {
    const delta = Date.now() - this.oldTime;
    this.requestAnimationFrameId = requestAnimationFrame(this.onRequestAnimationFrame.bind(this));
    this.oldTime += delta;
    this.onEnterFrame(delta / 1000);
  }
}
