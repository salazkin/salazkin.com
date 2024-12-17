import { Vec2 } from "types/Types";

/**
 * Converts degrees to radians.
 * @param {number} degrees - The angle in degrees.
 * @returns {number} - The angle in radians.
 */
const degreeToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Converts radians to degrees.
 * @param {number} radians - The angle in radians.
 * @returns {number} - The angle in degrees.
 */
const radiansToDegree = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

/**
 * Performs linear interpolation between two numbers.
 * @param {number} v1 - The start value.
 * @param {number} v2 - The end value.
 * @param {number} t - The interpolation factor (0 to 1).
 * @returns {number} - The interpolated value.
 */
const lerp = (v1: number, v2: number, t: number): number => {
  return v1 + (v2 - v1) * t;
};

/**
 * Performs linear interpolation between two 2D vectors.
 * @param {Vec2} v1 - The start vector.
 * @param {Vec2} v2 - The end vector.
 * @param {number} t - The interpolation factor (0 to 1).
 * @returns {Vec2} - The interpolated vector.
 */
const lerpVec2 = (v1: Vec2, v2: Vec2, t: number): Vec2 => {
  return [lerp(v1[0], v2[0], t), lerp(v1[1], v2[1], t)];
};

/**
 * Converts a numeric color value to an RGBA string.
 * @param {number} color - The color in hexadecimal format (e.g., 0xff00ff).
 * @param {number} [alpha=1] - The alpha value for transparency (0 to 1).
 * @returns {string} - The color as an RGBA string.
 */
const getColorStr = (color: number, alpha: number = 1): string => {
  return `rgba(${(color >> 16) & 0xff}, ${(color >> 8) & 0xff}, ${color & 0xff}, ${alpha})`;
};

/**
 * Adds two 2D vectors.
 * @param {Vec2} v1 - The first vector.
 * @param {Vec2} v2 - The second vector.
 * @returns {Vec2} - The resulting vector.
 */
const addVec2 = (v1: Vec2, v2: Vec2): Vec2 => {
  return [v1[0] + v2[0], v1[1] + v2[1]];
};

/**
 * Subtracts one 2D vector from another.
 * @param {Vec2} v1 - The first vector.
 * @param {Vec2} v2 - The second vector.
 * @returns {Vec2} - The resulting vector.
 */
const subtractVec2 = (v1: Vec2, v2: Vec2): Vec2 => {
  return [v1[0] - v2[0], v1[1] - v2[1]];
};

/**
 * Multiplies a 2D vector by a scalar value.
 * @param {Vec2} v - The vector to scale.
 * @param {number} scalar - The scalar multiplier.
 * @returns {Vec2} - The scaled vector.
 */
const multiplyScalarVec2 = (v: Vec2, scalar: number): Vec2 => {
  return [v[0] * scalar, v[1] * scalar];
};

/**
 * Returns a vector perpendicular to the input vector.
 * @param {Vec2} v - The input vector.
 * @returns {Vec2} - The perpendicular vector.
 */
const perpendicularVec2 = (v: Vec2): Vec2 => {
  return [-v[1], v[0]];
};

/**
 * Calculates the length (magnitude) of a 2D vector.
 * @param {Vec2} v - The input vector.
 * @returns {number} - The length of the vector.
 */
function vec2Length(v: Vec2): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

/**
 * Normalizes a 2D vector to a unit vector.
 * @param {Vec2} v - The input vector.
 * @returns {Vec2} - The normalized unit vector.
 * @throws {Error} - If the vector has zero length.
 */
function unitVec2(v: Vec2): Vec2 {
  const magnitude = vec2Length(v);
  if (magnitude === 0) {
    throw new Error("Cannot compute the unit vector of a zero vector.");
  }
  return [v[0] / magnitude, v[1] / magnitude];
}

/**
 * Smoothly interpolates between two 2D vectors using an exponential decay.
 * @param {Vec2} v1 - The current vector.
 * @param {Vec2} v2 - The target vector.
 * @param {number} decay - The decay factor.
 * @param {number} dt - The delta time (time step).
 * @returns {Vec2} - The interpolated vector.
 */
const smoothInterpolateVec2 = (v1: Vec2, v2: Vec2, decay: number, dt: number): Vec2 => {
  return [smoothInterpolate(v1[0], v2[0], decay, dt), smoothInterpolate(v1[1], v2[1], decay, dt)];
};

/**
 * Smoothly interpolates between two numbers using an exponential decay.
 * @param {number} a - The current value.
 * @param {number} b - The target value.
 * @param {number} decay - The decay factor.
 * @param {number} dt - The delta time (time step).
 * @returns {number} - The interpolated value.
 */
const smoothInterpolate = (a: number, b: number, decay: number, dt: number): number => {
  return b + (a - b) * Math.exp(-decay * dt);
};

/**
 * Rotates a point around a center by a specified angle.
 * @param {Vec2} p - The point to rotate.
 * @param {Vec2} center - The center of rotation.
 * @param {number} angle - The angle to rotate, in radians.
 * @returns {Vec2} - The rotated point.
 */
const rotatePointAround = (p: Vec2, center: Vec2, angle: number): Vec2 => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const x = p[0] - center[0];
  const y = p[1] - center[1];

  return [x * cos - y * sin + center[0], x * sin + y * cos + center[1]];
};

/**
 * Calculates the distance between two 2D points.
 * @param {Vec2} v1 - The first point.
 * @param {Vec2} v2 - The second point.
 * @returns {number} - The distance between the points.
 */
const distanceBetweenTwoPoints = (v1: Vec2, v2: Vec2): number => {
  const dx = v2[0] - v1[0];
  const dy = v2[1] - v1[1];
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculates the angle (in radians) between two 2D points.
 * @param {Vec2} v1 - The first point.
 * @param {Vec2} v2 - The second point.
 * @returns {number} - The angle in radians.
 */
const angleBetweenTwoPoints = (v1: Vec2, v2: Vec2): number => {
  const dx = v2[0] - v1[0];
  const dy = v2[1] - v1[1];
  return Math.atan2(dx, dy);
};

export {
  degreeToRadians,
  radiansToDegree,
  getColorStr,
  lerp,
  lerpVec2,
  smoothInterpolate,
  smoothInterpolateVec2,
  addVec2,
  subtractVec2,
  multiplyScalarVec2,
  vec2Length,
  unitVec2,
  perpendicularVec2,
  angleBetweenTwoPoints,
  distanceBetweenTwoPoints,
  rotatePointAround
};
