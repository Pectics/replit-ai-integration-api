import { useState, useEffect, useRef } from "react";

export type HealthResponse = {
  status: string;
};

export type ProviderInfo = {
  sdkBaseUrl: string;
  note: string;
  passthrough: string[];
  fakeResponse: string[];
  notImplemented: string[];
  models: string[] | string;
};

export type ProxyInfoResponse = {
  description: string;
  authentication: {
    header: string;
    scheme: string;
    note: string;
  };
  streaming: string;
  providers: {
    openai: ProviderInfo;
    anthropic: ProviderInfo;
    gemini: ProviderInfo;
    openrouter: ProviderInfo;
  };
};

const POLL_INTERVAL_MS = 10_000;

export function useProxyData() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [info, setInfo] = useState<ProxyInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function fetchHealth() {
      try {
        const res = await fetch("/healthz");
        if (!mountedRef.current) return;
        if (res.ok) {
          const data = await res.json();
          if (mountedRef.current) setHealth(data);
        } else {
          if (mountedRef.current) setHealth({ status: "degraded" });
        }
      } catch {
        if (mountedRef.current) setHealth({ status: "offline" });
      }
    }

    async function fetchInfo() {
      try {
        const res = await fetch("/info");
        if (!mountedRef.current) return;
        if (res.ok) {
          const data = await res.json();
          if (mountedRef.current) setInfo(data);
        }
      } catch (err) {
        if (mountedRef.current) setError(err instanceof Error ? err.message : "Failed to fetch");
      }
    }

    async function initialFetch() {
      setLoading(true);
      await Promise.all([fetchHealth(), fetchInfo()]);
      if (mountedRef.current) setLoading(false);
    }

    initialFetch();

    const intervalId = setInterval(fetchHealth, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
    };
  }, []);

  return { health, info, loading, error };
}
