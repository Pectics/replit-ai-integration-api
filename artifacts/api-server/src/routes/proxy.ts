import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { logger } from "../lib/logger";

const HOP_BY_HOP = new Set([
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

function requireProxyAuth(req: Request, res: Response, next: NextFunction): void {
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

interface ProviderConfig {
  baseUrlEnv: string;
  apiKeyEnv: string;
  authHeaders: (apiKey: string) => Record<string, string>;
}

const PROVIDERS: Record<string, ProviderConfig> = {
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

function createProviderRouter(providerName: string): IRouter {
  const config = PROVIDERS[providerName];
  const router: IRouter = Router();

  router.use(requireProxyAuth);

  router.all(/(.*)/, async (req: Request, res: Response): Promise<void> => {
    const baseUrl = process.env[config.baseUrlEnv];
    const apiKey = process.env[config.apiKeyEnv];

    if (!baseUrl || !apiKey) {
      res.status(500).json({
        error: `Provider ${providerName} is not configured (missing ${config.baseUrlEnv} or ${config.apiKeyEnv})`,
      });
      return;
    }

    // Build upstream URL: strip leading slash from req.url and append to baseUrl
    const upstreamUrl = baseUrl.replace(/\/$/, "") + req.url;

    // Build upstream headers: forward client headers, filter hop-by-hop, inject provider auth
    const upstreamHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (!HOP_BY_HOP.has(key.toLowerCase()) && typeof value === "string") {
        upstreamHeaders[key] = value;
      }
    }
    // Remove caller's Authorization header, then inject provider-specific auth
    delete upstreamHeaders["authorization"];
    delete upstreamHeaders["x-api-key"];
    delete upstreamHeaders["x-goog-api-key"];
    Object.assign(upstreamHeaders, config.authHeaders(apiKey));
    // Force no compression from upstream — gzip responses corrupt when double-decoded
    // through the Replit reverse proxy layer. Always request plain bytes.
    upstreamHeaders["accept-encoding"] = "identity";

    const method = (req.method ?? "GET").toUpperCase();
    const hasBody = !["GET", "HEAD"].includes(method);

    // req.body is a Buffer set by express.raw() middleware
    const bodyBuffer: Buffer | undefined =
      hasBody && req.body instanceof Buffer && req.body.length > 0
        ? req.body
        : undefined;

    try {
      const upstream = await fetch(upstreamUrl, {
        method,
        headers: upstreamHeaders,
        body: bodyBuffer,
      });

      // Forward status code
      res.status(upstream.status);

      // Forward response headers (filter hop-by-hop)
      for (const [key, value] of upstream.headers.entries()) {
        if (!HOP_BY_HOP.has(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      }

      if (!upstream.body) {
        res.end();
        return;
      }

      // Pipe response body to client without buffering (supports SSE and chunked streaming)
      Readable.fromWeb(upstream.body as WebReadableStream<Uint8Array>).pipe(res);
    } catch (err) {
      req.log.error({ err, provider: providerName }, "Proxy upstream error");
      if (!res.headersSent) {
        res.status(502).json({ error: "Bad gateway: upstream request failed" });
      }
    }
  });

  return router;
}

export const openaiRouter = createProviderRouter("openai");
export const anthropicRouter = createProviderRouter("anthropic");
export const geminiRouter = createProviderRouter("gemini");
export const openrouterRouter = createProviderRouter("openrouter");
