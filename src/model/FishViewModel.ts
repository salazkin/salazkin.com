import { quadEaseOut } from "utils/easingFunctions";

export const FishViewModel = new (class {
  // Total number of spine bones
  public readonly totalSpineBones: number = 5;

  // Maximum bending angle for the tail swing
  public readonly tailSwingMaxBend: number = 6;

  // Offset for tail follow-through movement, creating a snake-like motion
  public readonly tailSwingFollowOffset: number = 50;

  // Decay factor for smoothing the tail speed transition
  public readonly tailSpeedDecay: number = 1.5;

  // Decay factor for smoothing the blending of spine poses
  public readonly spineBlendDecay: number = 5;

  // Rotation angle for each spine bone during a turn
  public readonly spineTurnPoseBonesAngle: number = 13;

  // Dimensions of the fish
  public readonly fishWidth: number = 40;
  public readonly fishHeight: number = 120;

  // Total number of fish
  public readonly totalFishCount: number = 10;

  // Total number of colorful fish
  public readonly totalColorfulFishCount: number = 3;

  // Pool of available colors for colorful fish
  private fishColors: number[] = [0x99ff00, 0x00ccff, 0xff6600, 0xff9933, 0xff99cc, 0xff0000];

  // Default color for non-colorful fish
  private defaultFishColor: number = 0xaaaaaa;

  // Array to track assigned fish colors, avoiding duplicates
  private takenFishColors: number[] = [];

  /**
   * Calculates the scale for a spine bone based on its index.
   * Uses a quadratic easing function for smooth scaling.
   * @param {number} boneIndex - The index of the spine bone
   * @returns {number} - The scale value for the spine bone
   */
  public getSpineBoneScale(boneIndex: number): number {
    return quadEaseOut(boneIndex / this.totalSpineBones);
  }

  /**
   * Generates a random tail speed with optional "rush" behavior.
   * @param {boolean} rush - Whether the fish is rushing (faster movement)
   * @returns {{ startSpeed: number; endSpeed: number }} - The starting and ending tail speeds
   */
  public getRandomTailSpeed(rush: boolean): { startSpeed: number; endSpeed: number } {
    const randomMultiplier = 1 + Math.random() * 0.3;
    return {
      startSpeed: (rush ? 20 : 10) * randomMultiplier,
      endSpeed: 2 * randomMultiplier
    };
  }

  /**
   * Calculates a random decay factor for smoothing the fish's position.
   * @returns {number} - The decay factor
   */
  public getMoveDecay(): number {
    return 1 + Math.random() * 2;
  }

  /**
   * Assigns and returns a unique color for colorful fish based on their ID.
   * If the fish ID exceeds the colorful fish count, the default color is returned.
   * @param {number} fishId - The unique ID of the fish
   * @returns {number} - The assigned color for the fish
   */
  public getFishColor(fishId: number): number {
    if (fishId < this.totalColorfulFishCount) {
      if (this.takenFishColors[fishId] === undefined) {
        const randomColorIndex = Math.floor(Math.random() * this.fishColors.length);
        // Assign and remove the selected color to avoid duplicates
        this.takenFishColors[fishId] = this.fishColors.splice(randomColorIndex, 1)[0];
      }
      return this.takenFishColors[fishId];
    }
    return this.defaultFishColor;
  }
})();
