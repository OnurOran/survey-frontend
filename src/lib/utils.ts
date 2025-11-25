import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * Used throughout the application for conditional className merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
