export const quadEaseIn = (t: number): number => t * t;
export const quadEaseOut = (t: number): number => t * (2 - t);
export const quadEaseInOut = (t: number): number => ((t *= 2) < 1 ? 0.5 * t * t : -0.5 * (--t * (t - 2) - 1));

export const cubicEaseIn = (t: number): number => t * t * t;
export const cubicEaseOut = (t: number): number => --t * t * t + 1;
export const cubicEaseInOut = (t: number): number => ((t *= 2) < 1 ? 0.5 * t * t * t : 0.5 * ((t -= 2) * t * t + 2));

export const sinEaseIn = (t: number): number => 1 - Math.cos((t * Math.PI) / 2);
export const sinEaseOut = (t: number): number => Math.sin((t * Math.PI) / 2);
export const sinEaseInOut = (t: number): number => 0.5 * (1 - Math.cos(Math.PI * t));

export const circEaseIn = (t: number): number => 1 - Math.sqrt(1 - t * t);
export const circEaseOut = (t: number): number => Math.sqrt(1 - --t * t);
export const circEaseInOut = (t: number): number =>
  (t *= 2) < 1 ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);

export const elasticEaseIn = (t: number): number => {
  if (t === 0) {
    return 0;
  }
  if (t === 1) {
    return 1;
  }
  return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
};
export const elasticEaseOut = (t: number): number => {
  if (t === 0) {
    return 0;
  }
  if (t === 1) {
    return 1;
  }
  return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
};
export const elasticEaseInOut = (t: number): number => {
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

export const backEaseIn = (t: number): number => {
  const s = 1.70158;
  return t * t * ((s + 1) * t - s);
};
export const backEaseOut = (t: number): number => {
  const s = 1.70158;
  return --t * t * ((s + 1) * t + s) + 1;
};
export const backEaseInOut = (t: number): number => {
  const s = 1.70158 * 1.525;
  return (t *= 2) < 1 ? 0.5 * (t * t * ((s + 1) * t - s)) : 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
};

export const bounceEaseIn = (t: number): number => 1 - bounceEaseOut(1 - t);
export const bounceEaseOut = (t: number): number => {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  } else if (t < 2.5 / 2.75) {
    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  }
  return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
};
export const bounceEaseInOut = (t: number): number =>
  t < 0.5 ? bounceEaseIn(t * 2) * 0.5 : bounceEaseOut(t * 2 - 1) * 0.5 + 0.5;
