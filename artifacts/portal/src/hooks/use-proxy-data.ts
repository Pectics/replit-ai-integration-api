import { useState, useEffect } from "react";

export type HealthResponse = {
  status: string;
};

export type ProviderInfo = {
  sdkBaseUrl: string;
  note: string;
  passthrough: string[];
  fakeResponse: string[];
  notImplemented: string[];
  models: string[];
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

export function useProxyData() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [info, setInfo] = useState<ProxyInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        const [healthRes, infoRes] = await Promise.all([
          fetch("/healthz").catch(() => null),
          fetch("/info").catch(() => null)
        ]);

        if (healthRes && healthRes.ok) {
          const healthData = await healthRes.json();
          if (mounted) setHealth(healthData);
        }

        if (infoRes && infoRes.ok) {
          const infoData = await infoRes.json();
          if (mounted) setInfo(infoData);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return { health, info, loading, error };
}
