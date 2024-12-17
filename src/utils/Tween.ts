export class Tween {
  private startTime: number;
  private resolve: (tween: Tween) => void = null;
  private duration: number;
  private ease: (t: number) => number;
  private onUpdate: (value: number) => void;
  private isReverse = false;
  private static tweens: Set<Tween> = new Set();
  private static requestAnimationFrameId: number;

  /**
   * Adds a tween to the active tweens Set and starts the Ticker if it's the first one.
   * @param tween - The tween to add.
   */
  private static add(tween: Tween): void {
    if (this.tweens.size === 0) {
      //Ticker.shared.add(this.onEnterFrame, this);
      this.requestAnimationFrameId = requestAnimationFrame(this.onEnterFrame);
    }
    this.tweens.add(tween);
  }

  /**
   * Removes a tween from the active tweens Set and stops the Ticker if it's the last one.
   * @param tween - The tween to remove.
   */
  private static remove(tween: Tween): void {
    this.tweens.delete(tween);
    if (this.tweens.size === 0) {
      //Ticker.shared.remove(this.onEnterFrame, this);
      cancelAnimationFrame(this.requestAnimationFrameId);
    }
  }

  /**
   * This function gets called every frame by the Ticker.
   * Calls each active tween's `tick` method.
   */
  private static onEnterFrame = (): void => {
    const time = this.now();
    this.tweens.forEach(tween => {
      tween.tick(time);
    });
    this.requestAnimationFrameId = requestAnimationFrame(this.onEnterFrame);
  };

  /**
   * Returns the current time in milliseconds.
   * @return Current time in milliseconds.
   */
  private static now(): number {
    return performance.now();
  }

  /**
   * Constructor for Tween class.
   * @param duration - The duration of the tween.
   * @param onUpdate - Callback function for update events.
   * @param ease - Easing function for the tween.
   */
  constructor(duration: number, onUpdate: (t: number) => void, ease: (t: number) => number = Ease.Linear) {
    this.duration = duration;
    this.ease = ease;
    this.onUpdate = onUpdate;
  }

  /**
   * Set new parameters for this Tween.
   * @param params - New parameters for the Tween.
   */
  public params(params: { duration?: number; onUpdate?: (t: number) => void; ease?: (t: number) => number }): Tween {
    Tween.remove(this);
    Object.assign(this, params);
    return this;
  }

  /**
   * Starts the tween.
   */
  public start(): Promise<Tween> {
    this.isReverse = false;
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.startTime = Tween.now();
      Tween.add(this);
    });
  }

  /**
   * Reverses the tween.
   */
  public reverse(): Promise<Tween> {
    this.isReverse = true;
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.startTime = Tween.now();
      Tween.add(this);
    });
  }

  /**
   * Called every frame to update the tween.
   * @param time - The current time.
   */
  private tick(time: number): void {
    let progress = (time - this.startTime) / this.duration;
    if (progress > 1) {
      progress = 1;
    }
    if (this.onUpdate) {
      const t = this.ease(this.isReverse ? 1 - progress : progress);
      this.onUpdate(t);
    }
    if (progress >= 1) {
      this.stop();
    }
  }

  /**
   * Ends the tween instantly.
   */
  public endInstantly(): void {
    this.onUpdate(this.isReverse ? 0 : 1);
    this.stop();
  }

  /**
   * Stops the tween.
   */
  public stop(): void {
    Tween.remove(this);
    if (this.resolve) {
      this.resolve(this);
      this.resolve = null;
    }
  }

  /**
   * Kills the tween.
   */
  public kill() {
    Tween.remove(this);
    this.onUpdate = null;
    this.ease = null;
    this.resolve = null;
  }
}
/**
 * Class that maintains a pool of Tween objects for reuse.
 * This avoids creating new Tween objects each time, which can be costly in terms of performance.
 */
export class TweenPool {
  private static pool: Tween[] = [];

  /**
   * Fetches a Tween object from the pool. If the pool is empty, a new Tween object is created.
   * @param duration - Duration of the tween.
   * @param onUpdate - Callback function called on update events.
   * @param ease - Easing function for the tween.
   * @return - A Tween object.
   */
  public static getTween(
    duration: number,
    onUpdate: (t: number) => void,
    ease: (t: number) => number = Ease.Linear
  ): Tween {
    let out: Tween;
    // If there's an available Tween in the pool, retrieve it and reset its parameters.
    if (this.pool.length) {
      out = this.pool.pop();
      out.params({ duration, onUpdate, ease });
    } else {
      out = new Tween(duration, onUpdate, ease);
    }
    return out;
  }

  /**
   * Returns a Tween object back to the pool.
   * @param tween - The Tween object to return to the pool.
   */
  public static returnTween(tween: Tween): void {
    tween.kill();
    this.pool.unshift(tween);
  }
}

/**
 * Function that starts a Tween, then returns it to the pool once it's finished.
 * @param duration - Duration of the tween.
 * @param cb - Callback function to be called on update events.
 * @param ease - Easing function for the tween.
 * @return - A Promise that resolves once the Tween is finished.
 */
export const tween = (
  duration: number,
  cb: (t: number) => void,
  ease: (t: number) => number = Ease.Linear
): Promise<void> => {
  return new Promise(resolve => {
    const tween = TweenPool.getTween(duration, cb, ease);
    tween.start().then(() => {
      TweenPool.returnTween(tween);
      resolve();
    });
  });
};

/**
 * Class that provides various easing functions.
 * Easing functions are used to create different kinds of motion in a Tween.
 * For example, an object might move slower at the beginning and faster at the end, or vice versa.
 * These are all mathematical functions that map the time (which progresses linearly) to progress (which can vary depending on the function).
 */
export class Ease {
  static readonly Linear = (t: number) => t;

  static readonly QuadEaseIn = (t: number): number => t * t;
  static readonly QuadEaseOut = (t: number): number => t * (2 - t);
  static readonly QuadEaseInOut = (t: number): number => ((t *= 2) < 1 ? 0.5 * t * t : -0.5 * (--t * (t - 2) - 1));

  static readonly CubicEaseIn = (t: number): number => t * t * t;
  static readonly CubicEaseOut = (t: number): number => --t * t * t + 1;
  static readonly CubicEaseInOut = (t: number): number =>
    (t *= 2) < 1 ? 0.5 * t * t * t : 0.5 * ((t -= 2) * t * t + 2);

  static readonly QuarticEaseIn = (t: number): number => t * t * t * t;
  static readonly QuarticEaseOut = (t: number): number => 1 - --t * t * t * t;
  static readonly QuarticEaseInOut = (t: number): number =>
    (t *= 2) < 1 ? 0.5 * t * t * t * t : -0.5 * ((t -= 2) * t * t * t - 2);

  static readonly QuinticEaseIn = (t: number): number => t * t * t * t * t;
  static readonly QuinticEaseOut = (t: number): number => --t * t * t * t * t + 1;
  static readonly QuinticEaseInOut = (t: number): number =>
    (t *= 2) < 1 ? 0.5 * t * t * t * t * t : 0.5 * ((t -= 2) * t * t * t * t + 2);

  static readonly SinEaseIn = (t: number): number => 1 - Math.cos((t * Math.PI) / 2);
  static readonly SinEaseOut = (t: number): number => Math.sin((t * Math.PI) / 2);
  static readonly SinEaseInOut = (t: number): number => 0.5 * (1 - Math.cos(Math.PI * t));

  static readonly CircEaseIn = (t: number): number => 1 - Math.sqrt(1 - t * t);
  static readonly CircEaseOut = (t: number): number => Math.sqrt(1 - --t * t);
  static readonly CircEaseInOut = (t: number): number =>
    (t *= 2) < 1 ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);

  static readonly ElasticEaseIn = (t: number): number => {
    if (t === 0) {
      return 0;
    }
    if (t === 1) {
      return 1;
    }
    return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
  };

  static readonly ElasticEaseOut = (t: number): number => {
    if (t === 0) {
      return 0;
    }
    if (t === 1) {
      return 1;
    }
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
  };

  static readonly ElasticEaseInOut = (t: number): number => {
    if (t === 0) {
      return 0;
    }
    if (t === 1) {
      return 1;
    }
    t *= 2;
    return t < 1
      ? -0.5 * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI)
      : 0.5 * Math.pow(2, -10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI) + 1;
  };

  static readonly BackEaseIn = (t: number): number => {
    const s = 1.70158;
    return t * t * ((s + 1) * t - s);
  };

  static readonly BackEaseOut = (t: number): number => {
    const s = 1.70158;
    return --t * t * ((s + 1) * t + s) + 1;
  };

  static readonly BackEaseInOut = (t: number): number => {
    const s = 1.70158 * 1.525;
    return (t *= 2) < 1 ? 0.5 * (t * t * ((s + 1) * t - s)) : 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
  };

  static readonly BounceEaseIn = (t: number): number => 1 - Ease.BounceEaseOut(1 - t);
  static readonly BounceEaseOut = (t: number): number => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    }
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  };

  static readonly BounceEaseInOut = (t: number): number =>
    t < 0.5 ? Ease.BounceEaseIn(t * 2) * 0.5 : Ease.BounceEaseOut(t * 2 - 1) * 0.5 + 0.5;
}
