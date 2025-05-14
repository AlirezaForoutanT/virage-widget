//  src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";

/** Tailwind-aware classNames helper (unchanged). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** RFC-4122 random uuid (v4). */
export const uuid = uuidv4;

/** No-op placeholder. */
export const noop = () => {};

/** Awaitable delay – handy in tests & demos. */
export const sleep = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, ms));
