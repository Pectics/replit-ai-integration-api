import { type Request, type Response, type NextFunction } from "express";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";

export const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

export interface ProviderConfig {
  baseUrlEnv: string;
  apiKeyEnv: string;
  authHeaders: (apiKey: string) => Record<string, string>;
}

export const PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    baseUrlEnv: "AI_INTEGRATIONS_OPENAI_BASE_URL",
    apiKeyEnv: "AI_INTEGRATIONS_OPENAI_API_KEY",
    authHeaders: (key) => ({ authorization: `Bearer ${key}` }),
  },
  anthropic: {
    baseUrlEnv: "AI_INTEGRATIONS_ANTHROPIC_BASE_URL",
    apiKeyEnv: "AI_INTEGRATIONS_ANTHROPIC_API_KEY",
    authHeaders: (key) => ({
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    }),
  },
  gemini: {
    baseUrlEnv: "AI_INTEGRATIONS_GEMINI_BASE_URL",
    apiKeyEnv: "AI_INTEGRATIONS_GEMINI_API_KEY",
    authHeaders: (key) => ({ "x-goog-api-key": key }),
  },
  openrouter: {
    baseUrlEnv: "AI_INTEGRATIONS_OPENROUTER_BASE_URL",
    apiKeyEnv: "AI_INTEGRATIONS_OPENROUTER_API_KEY",
    authHeaders: (key) => ({ authorization: `Bearer ${key}` }),
  },
};

export function requireProxyAuth(req: Request, res: Response, next: NextFunction): void {
  const proxyKey = process.env.PROXY_API_KEY;
  if (!proxyKey) {
    res.status(500).json({ error: "PROXY_API_KEY is not configured on the server" });
    return;
  }
  const auth = req.headers["authorization"];
  if (!auth || auth !== `Bearer ${proxyKey}`) {
    res.status(401).json({ error: "Unauthorized: invalid or missing Bearer token" });
    return;
  }
  next();
}

export function notImplemented(reason: string) {
  return (_req: Request, res: Response): void => {
    res.status(501).json({
      error: "Not Implemented",
      message: reason,
    });
  };
}

/**
 * Try to proxy the request upstream. If the upstream returns 404 (endpoint not
 * found) or a network error occurs, fall back to a 501 Not Implemented response
 * with the provided message. All other upstream status codes are forwarded verbatim.
 */
export async function probeAndProxy(
  req: Request,
  res: Response,
  providerName: string,
  notSupportedMessage: string,
): Promise<void> {
  const config = PROVIDERS[providerName];
  const baseUrl = process.env[config.baseUrlEnv];
  const apiKey = process.env[config.apiKeyEnv];

  if (!baseUrl || !apiKey) {
    res.status(500).json({ error: `Provider ${providerName} is not configured` });
    return;
  }

  const upstreamUrl = baseUrl.replace(/\/$/, "") + req.url;
  const upstreamHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!HOP_BY_HOP.has(key.toLowerCase()) && typeof value === "string") {
      upstreamHeaders[key] = value;
    }
  }
  delete upstreamHeaders["authorization"];
  delete upstreamHeaders["x-api-key"];
  delete upstreamHeaders["x-goog-api-key"];
  Object.assign(upstreamHeaders, config.authHeaders(apiKey));
  upstreamHeaders["accept-encoding"] = "identity";

  const method = (req.method ?? "GET").toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const bodyBuffer: Buffer | undefined =
    hasBody && req.body instanceof Buffer && req.body.length > 0 ? req.body : undefined;

  try {
    const upstream = await fetch(upstreamUrl, { method, headers: upstreamHeaders, body: bodyBuffer });

    if (upstream.status === 404) {
      res.status(501).json({ error: "Not Implemented", message: notSupportedMessage });
      return;
    }

    if (upstream.status === 400) {
      const text = await upstream.text();
      if (text.includes("INVALID_ENDPOINT")) {
        res.status(501).json({ error: "Not Implemented", message: notSupportedMessage });
        return;
      }
      res.status(400);
      for (const [key, value] of upstream.headers.entries()) {
        if (!HOP_BY_HOP.has(key.toLowerCase())) res.setHeader(key, value);
      }
      res.end(text);
      return;
    }

    res.status(upstream.status);
    for (const [key, value] of upstream.headers.entries()) {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }
    if (!upstream.body) { res.end(); return; }
    Readable.fromWeb(upstream.body as WebReadableStream<Uint8Array>).pipe(res);
  } catch (_err) {
    res.status(501).json({ error: "Not Implemented", message: notSupportedMessage });
  }
}

export async function proxyRequest(
  req: Request,
  res: Response,
  providerName: string,
): Promise<void> {
  const config = PROVIDERS[providerName];
  const baseUrl = process.env[config.baseUrlEnv];
  const apiKey = process.env[config.apiKeyEnv];

  if (!baseUrl || !apiKey) {
    res.status(500).json({
      error: `Provider ${providerName} is not configured (missing ${config.baseUrlEnv} or ${config.apiKeyEnv})`,
    });
    return;
  }

  const upstreamUrl = baseUrl.replace(/\/$/, "") + req.url;

  const upstreamHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!HOP_BY_HOP.has(key.toLowerCase()) && typeof value === "string") {
      upstreamHeaders[key] = value;
    }
  }
  delete upstreamHeaders["authorization"];
  delete upstreamHeaders["x-api-key"];
  delete upstreamHeaders["x-goog-api-key"];
  Object.assign(upstreamHeaders, config.authHeaders(apiKey));
  upstreamHeaders["accept-encoding"] = "identity";

  const method = (req.method ?? "GET").toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const bodyBuffer: Buffer | undefined =
    hasBody && req.body instanceof Buffer && req.body.length > 0 ? req.body : undefined;

  try {
    const upstream = await fetch(upstreamUrl, { method, headers: upstreamHeaders, body: bodyBuffer });

    res.status(upstream.status);
    for (const [key, value] of upstream.headers.entries()) {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    if (!upstream.body) {
      res.end();
      return;
    }

    Readable.fromWeb(upstream.body as WebReadableStream<Uint8Array>).pipe(res);
  } catch (err) {
    req.log.error({ err, provider: providerName }, "Proxy upstream error");
    if (!res.headersSent) {
      res.status(502).json({ error: "Bad gateway: upstream request failed" });
    }
  }
}
