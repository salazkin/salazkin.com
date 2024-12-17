import { FishEvents } from "events/FishEvents";

export type Vec2 = [number, number];

declare global {
  interface Events extends FishEvents {}
}
