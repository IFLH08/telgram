import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchSprintDeveloperMetrics } from './dashboardApi';

export function useSprintDeveloperMetrics() {
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeController = useRef(null);

  const loadMetrics = useCallback(() => {
    if (activeController.current) {
      activeController.current.abort();
    }

    const controller = new AbortController();
    activeController.current = controller;

    setIsLoading(true);
    setError(null);

    fetchSprintDeveloperMetrics(controller.signal)
      .then((result) => {
        if (activeController.current === controller) {
          activeController.current = null;
        }
        setMetrics(result);
        setIsLoading(false);
      })
      .catch((loadError) => {
        if (loadError.name === 'AbortError') {
          return;
        }

        if (activeController.current === controller) {
          activeController.current = null;
        }
        setError(loadError);
        setMetrics([]);
        setIsLoading(false);
      });

    return controller;
  }, []);

  useEffect(() => {
    const controller = loadMetrics();
    return () => controller.abort();
  }, [loadMetrics]);

  return {
    metrics,
    isLoading,
    error,
    reload: loadMetrics,
  };
}
