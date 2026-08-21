import { useState, useCallback } from 'react';
import { APIError } from '../lib/api/errors';

interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: APIError) => void;
}

export function useApi<T, P extends unknown[] = unknown[]>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(options.initialData ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<APIError | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiFunction(...args);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (e: unknown) {
        const error = e as APIError;
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, options]
  );

  return {
    data,
    isLoading,
    error,
    execute,
    setData, // Expose for optimistic updates
  };
}
