import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// A utility function to combine and merge Tailwind CSS class names
export function cn(...inputs: ClassValue[]) {
  // Use clsx to join class names conditionally and twMerge to handle Tailwind CSS class conflicts
  return twMerge(clsx(inputs));
}
