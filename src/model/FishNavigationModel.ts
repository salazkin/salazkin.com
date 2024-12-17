import { Vec2 } from "types/Types";
import { Signal } from "utils/Signal";
import {
  addVec2,
  degreeToRadians,
  distanceBetweenTwoPoints,
  multiplyScalarVec2,
  perpendicularVec2,
  unitVec2
} from "utils/Utils";

/**
 * Represents the direction of a turn.
 * -1: Left turn, 0: No turn, 1: Right turn.
 */
export type TurnDirection = -1 | 0 | 1;

/**
 * FishNavigationModel handles the movement logic, rotation, and navigation behavior of a fish.
 */
export class FishNavigationModel {
  /** The current movement speed of the fish. */
  private currentSpeed: number;

  /** Indicates whether the fish is in a "rush" state for faster movement. */
  private rush: boolean = false;

  /** The current rotation angle of the fish in radians. */
  private currentRotation: number;

  /** The current movement direction of the fish as a normalized vector. */
  private currentMoveDirection: Vec2;

  /** The current position of the fish on the screen. */
  private currentPos: Vec2 = [0, 0];

  /** The radius used for determining if the fish is outside screen bounds. */
  private fishBoundsRadius = 120;

  /** The current turn direction of the fish (-1, 0, or 1). */
  private turnDirection: TurnDirection = 0;

  /** Signal dispatched when the turn direction changes. */
  public onTurnDirectionChangeSignal: Signal<TurnDirection> = new Signal();

  constructor() {
    this.setRandomSpeed();
    this.setCurrentRotation(degreeToRadians(Math.random() * 360));
    this.setCurrentPosition(-120 - Math.random() * 120, -120 - Math.random() * 120);
  }

  /**
   * Sets the current position of the fish.
   * @param {number} x - The x-coordinate of the position.
   * @param {number} y - The y-coordinate of the position.
   */
  public setCurrentPosition(x: number, y: number): void {
    this.currentPos[0] = x;
    this.currentPos[1] = y;
  }

  /**
   * Sets the current rotation of the fish in radians.
   * Also recalculates the movement direction based on the new rotation.
   * @param {number} angle - The rotation angle in radians.
   */
  public setCurrentRotation(angle: number): void {
    this.currentRotation = angle;
    this.currentMoveDirection = unitVec2([Math.cos(this.currentRotation), Math.sin(this.currentRotation)]);
  }

  /**
   * Retrieves the current rotation angle in radians.
   * @returns {number} The current rotation angle.
   */
  public getCurrentRotation(): number {
    return this.currentRotation;
  }

  /**
   * Sets the turn direction of the fish and emits a signal if the direction changes.
   * @param {TurnDirection} value - The new turn direction (-1, 0, or 1).
   */
  public setTurnDirection(value: TurnDirection): void {
    if (this.turnDirection !== value) {
      this.turnDirection = value;
      this.onTurnDirectionChangeSignal.dispatch(this.turnDirection);
    }
  }

  /**
   * Retrieves the current turn direction of the fish.
   * @returns {TurnDirection} The current turn direction.
   */
  public getTurnDirection(): TurnDirection {
    return this.turnDirection;
  }

  /**
   * Retrieves the current movement direction as a vector.
   * @returns {Vec2} A copy of the current movement direction vector.
   */
  public getCurrentMoveDirection(): Vec2 {
    return [...this.currentMoveDirection];
  }

  /**
   * Retrieves the current position of the fish.
   * @returns {Vec2} A copy of the current position vector.
   */
  public getCurrentPosition(): Vec2 {
    return [...this.currentPos];
  }

  /**
   * Generates a random rotation angle and its center point for movement.
   * @returns An object containing the center point, angle, and radius of rotation.
   */
  public getRandomRotationAngle(): { center: Vec2; angle: number; radius: number } {
    const randomDistance = Math.random() * 90 + 30; // Random radius.
    let randomAngle = Math.random() * 190; // Random angle.
    if (Math.random() > 0.3) {
      randomAngle *= 0.6; // Reduces wide angle probability.
    }

    // Calculate a perpendicular direction for rotation center.
    const anglePerpendicular = perpendicularVec2(this.currentMoveDirection);
    const side = Math.floor(Math.random() * 2) * 2 - 1; // Randomly choose left (-1) or right (1).
    anglePerpendicular[0] *= side;
    anglePerpendicular[1] *= side;

    return {
      center: addVec2(this.currentPos, multiplyScalarVec2(anglePerpendicular, randomDistance)),
      angle: randomAngle * side,
      radius: randomDistance
    };
  }

  /**
   * Generates a random forward point in the current movement direction.
   * The distance is scaled if the fish is in a "rush" state.
   * @returns {Vec2} A new forward point.
   */
  public getRandomForwardPoint(): Vec2 {
    const rushMultiplier = this.rush ? 1.6 + Math.random() * 1.6 : 1; // Increase distance during rush.
    const randomDistance = (Math.random() * 150 + 150) * rushMultiplier;
    return addVec2(this.currentPos, multiplyScalarVec2(this.currentMoveDirection, randomDistance));
  }

  /**
   * Generates a random position within the screen bounds.
   * @returns {Vec2} A random screen position.
   */
  public getRandomPointOnScreen(): Vec2 {
    const stageWidth = window.innerWidth;
    const stageHeight = window.innerHeight;
    return [Math.random() * stageWidth, Math.random() * stageHeight];
  }

  /**
   * Finds the closest random point on the screen to the current position.
   * @returns {Vec2} The closest randomly generated screen position.
   */
  public getClosestRandomPointOnScreen(): Vec2 {
    let currentPoint = this.getRandomPointOnScreen();
    let distance = distanceBetweenTwoPoints(this.currentPos, currentPoint);

    // Test multiple points and select the closest one.
    for (let i = 0; i < 5; i++) {
      const newPoint = this.getRandomPointOnScreen();
      const newDistance = distanceBetweenTwoPoints(this.currentPos, newPoint);
      if (newDistance < distance) {
        currentPoint = [...newPoint];
        distance = newDistance;
      }
    }
    return currentPoint;
  }

  /**
   * Sets a random movement speed for the fish, scaling up during rush.
   */
  public setRandomSpeed(): void {
    const rushMultiplier = this.rush ? 3.2 + Math.random() * 1.6 : 1;
    this.currentSpeed = (300 + Math.random() * 300) * rushMultiplier;
  }

  /**
   * Sets the rush state of the fish.
   * @param {boolean} value - True to enable rush mode, false otherwise.
   */
  public setRush(value: boolean): void {
    this.rush = value;
  }

  /**
   * Randomly determines whether the fish should enter rush mode.
   */
  public setRandomRush(): void {
    this.rush = Math.random() < 0.2;
  }

  /**
   * Checks if the fish is in rush mode.
   * @returns {boolean} True if in rush mode, false otherwise.
   */
  public isRush(): boolean {
    return this.rush;
  }

  /**
   * Calculates the duration needed to move a given distance based on current speed.
   * @param {number} distance - The distance to be traveled.
   * @returns {number} The duration in milliseconds.
   */
  public getMoveDuration(distance: number): number {
    return (distance / this.currentSpeed) * 1000;
  }

  /**
   * Checks whether the fish is outside the screen bounds.
   * @returns {boolean} True if the fish is outside bounds, false otherwise.
   */
  public isFishOutsideScreenBounds(): boolean {
    const stageWidth = window.innerWidth;
    const stageHeight = window.innerHeight;
    const [x, y] = this.currentPos;
    return (
      x + this.fishBoundsRadius < 0 ||
      x - this.fishBoundsRadius > stageWidth ||
      y + this.fishBoundsRadius < 0 ||
      y - this.fishBoundsRadius > stageHeight
    );
  }

  /**
   * Generates a random delay duration for idle behavior.
   * @returns {number} A delay duration in milliseconds.
   */
  public getRandomIdleDelay(): number {
    return Math.random() * 2000 + 100;
  }
}
