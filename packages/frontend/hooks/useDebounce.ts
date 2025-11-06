import { useState, useEffect } from 'react';

/**
 * Hook that debounces a value by the specified delay
 * Useful for search inputs to avoid making API calls on every keystroke
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay is up
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};