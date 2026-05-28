import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges Tailwind CSS class names, resolving conflicts.
 * Uses `clsx` to join class arrays/objects, and `twMerge` to eliminate duplicate/conflicting Tailwind utilities.
 * 
 * @param inputs - List of class values (strings, arrays, objects, or falsy values) to combine.
 * @returns A consolidated className string with conflicts resolved.
 * 
 * @example
 * ```typescript
 * cn("bg-red-500 p-4", isHovered && "bg-blue-500", "p-2"); // returns "bg-blue-500 p-2"
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
