import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Dependency of Shadcn UI
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Capitalize the first letter of a string.
 *
 * @param val The string to capitalize the first letter of.
 * @returns The string with the first letter capitalized.
 */
export function capitalizeFirstLetter(val: string) {
  return val.charAt(0).toUpperCase() + String(val).slice(1);
}

/**
 * Get the common prefix of two strings.
 * @param a The first string.
 * @param b The second string.
 * @returns The common prefix of the two strings a and b.
 */
export function getCommonPrefix(a: string, b: string) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) {
    i++;
  }
  return a.slice(0, i);
}
