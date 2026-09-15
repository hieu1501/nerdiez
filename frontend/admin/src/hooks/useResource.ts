"use client";

import { useCallback, useEffect, useState } from "react";
import { invalidateCache } from "@/services/api";

// A response belongs to both its loader and refresh version. Old requests never
// replace the current page, including while a new request has not yet completed.
export function useResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<{
    load: typeof load;
    version: number;
    data?: T;
    error?: Error;
  }>();

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ load, version, data });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ load, version, error: error instanceof Error ? error : new Error("Unable to load data.") });
        }
      },
    );
    return () => controller.abort();
  }, [load, version]);

  const reload = useCallback(() => {
    invalidateCache();
    setVersion((current) => current + 1);
  }, []);
  const current = result?.load === load && result.version === version;
  return { data: current ? result.data : undefined, error: current ? result.error : undefined, loading: !current, reload };
}
