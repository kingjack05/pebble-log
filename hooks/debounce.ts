import { debounce } from "@/lib/utils";
import { useEffect, useMemo, useRef } from "react";

/**
 * Copied from https://www.developerway.com/posts/debouncing-in-react#part3
 */
export const useDebounce = (callback: Function, waitFor = 300) => {
  const ref = useRef<Function>();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.();
    };

    return debounce(func, waitFor);
  }, []);

  return debouncedCallback;
};
