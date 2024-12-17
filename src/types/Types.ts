import { FishEvents } from "events/FishEvents";

export type Vec2 = [number, number];
export type Rect = { x: number; y: number; w: number; h: number };

declare global {
  interface Events extends FishEvents {}
}
