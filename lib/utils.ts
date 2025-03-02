import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Copied from https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940?permalink_comment_id=5073259#gistcomment-5073259
 */
export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<F>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

export function range(start: number, stop: number, step = 1) {
  const result = [];
  for (let i = start; i < stop; i += step) {
    result.push(i);
  }
  return result;
}
