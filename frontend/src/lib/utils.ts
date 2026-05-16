import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging tailwind classes with proper overrides
 * Standard in modern professional React/Next.js projects
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
