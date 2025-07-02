import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiFunction(...args);
      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      onError?.(errorMessage);
      throw error;
    }
  }, [apiFunction, onSuccess, onError]);

  useEffect(() => {
    let isMounted = true;
    
    if (immediate) {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      apiFunction()
        .then(result => {
          if (isMounted) {
            setState({ data: result, loading: false, error: null });
            onSuccess?.(result);
          }
        })
        .catch(error => {
          if (isMounted) {
            const errorMessage = error.response?.data?.detail || error.message || 'An error occurred';
            setState(prev => ({ ...prev, loading: false, error: errorMessage }));
            onError?.(errorMessage);
          }
        });
    }
    
    return () => {
      isMounted = false;
    };
  }, [immediate, apiFunction, onSuccess, onError]);

  return {
    ...state,
    execute,
    refetch: execute,
  };
}

export function useMutation<T = any, P = any>(
  apiFunction: (params: P) => Promise<T>,
  options: UseApiOptions = {}
) {
  const { onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiFunction(params);
      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      onError?.(errorMessage);
      throw error;
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}