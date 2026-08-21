import { useState, useCallback, useRef, useEffect } from 'react';
import { APIError } from '../lib/api/errors';

export interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: APIError | null;
  isEmpty: boolean;
  isOffline: boolean;
}

export interface UseApiStateOptions<T> {
  initialData?: T;
  executeOnMount?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: APIError) => void;
}

export function useApiState<T, P extends unknown[] = unknown[]>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiStateOptions<T> = {}
) {
  const apiFunctionRef = useRef(apiFunction);
  const optionsRef = useRef(options);

  // Keep refs updated with latest values to avoid stale closures,
  // without triggering re-renders or recreating the execute callback
  useEffect(() => {
    apiFunctionRef.current = apiFunction;
    optionsRef.current = options;
  });
  const [state, setState] = useState<ApiState<T>>({
    data: options.initialData ?? null,
    isLoading: false,
    error: null,
    isEmpty: false,
    isOffline: false,
  });

  const lastArgsRef = useRef<P | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      lastArgsRef.current = args;
      
      setState((prev) => ({ ...prev, isLoading: true, error: null, isOffline: false }));
      
      try {
        const result = await apiFunctionRef.current(...args);
        
        let isEmpty = false;
        if (Array.isArray(result) && result.length === 0) isEmpty = true;
        else if (result && typeof result === 'object' && Object.keys(result).length === 0) isEmpty = true;

        setState({
          data: result,
          isLoading: false,
          error: null,
          isEmpty,
          isOffline: false,
        });
        
        optionsRef.current.onSuccess?.(result);
        return result;
      } catch (e: unknown) {
        const error = e as APIError;
        
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error,
          isOffline: error.status === 0 || error.message.includes('Network Error'),
        }));
        
        optionsRef.current.onError?.(error);
        throw error;
      }
    },
    []
  );

  const retry = useCallback(() => {
    if (lastArgsRef.current) {
      return execute(...lastArgsRef.current);
    }
    // Type casting to P to allow retry even if args are empty
    return execute(...([] as unknown as P));
  }, [execute]);

  // Execute on mount if required and we have no arguments to pass
  useEffect(() => {
    if (options.executeOnMount) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      execute(...([] as unknown as P)).catch(() => {});
    }
  }, [options.executeOnMount, execute]);

  return {
    ...state,
    execute,
    retry,
    setData: (data: T | null | ((prev: T | null) => T | null)) => setState(prev => ({ 
      ...prev, 
      data: typeof data === 'function' ? (data as (prev: T | null) => T | null)(prev.data) : data 
    })),
  };
}
