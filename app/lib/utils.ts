import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomBinaryString(length: number) {
  let binaryString = "";
  for (let i = 0; i < length; i++) {
    binaryString += Math.floor(Math.random() * 2); // Generates either 0 or 1
  }
  return binaryString;
}
