import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";

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

// ─────────────────────────────────────────────────────────────────────────────
// Static model lists  (sourced from Replit AI Integrations skill definitions)
// ─────────────────────────────────────────────────────────────────────────────

const OPENAI_MODELS_RESPONSE = {
  object: "list",
  data: [
    { id: "gpt-5.3-codex",           object: "model", created: 1746000000, owned_by: "openai" },
    { id: "gpt-5.2",                  object: "model", created: 1745500000, owned_by: "openai" },
    { id: "gpt-5.2-codex",           object: "model", created: 1745500000, owned_by: "openai" },
    { id: "gpt-5.1",                  object: "model", created: 1744000000, owned_by: "openai" },
    { id: "gpt-5",                    object: "model", created: 1743000000, owned_by: "openai" },
    { id: "gpt-5-mini",              object: "model", created: 1743000000, owned_by: "openai" },
    { id: "gpt-5-nano",              object: "model", created: 1743000000, owned_by: "openai" },
    { id: "gpt-4.1",                  object: "model", created: 1740000000, owned_by: "openai" },
    { id: "gpt-4.1-mini",            object: "model", created: 1740000000, owned_by: "openai" },
    { id: "gpt-4.1-nano",            object: "model", created: 1740000000, owned_by: "openai" },
    { id: "gpt-4o",                   object: "model", created: 1715367049, owned_by: "openai" },
    { id: "gpt-4o-mini",             object: "model", created: 1721172717, owned_by: "openai" },
    { id: "gpt-image-1",             object: "model", created: 1743000000, owned_by: "openai" },
    { id: "gpt-audio",               object: "model", created: 1743000000, owned_by: "openai" },
    { id: "gpt-audio-mini",          object: "model", created: 1743000000, owned_by: "openai" },
    { id: "gpt-4o-mini-transcribe",  object: "model", created: 1741000000, owned_by: "openai" },
    { id: "o4-mini",                  object: "model", created: 1745000000, owned_by: "openai" },
    { id: "o3",                       object: "model", created: 1744000000, owned_by: "openai" },
    { id: "o3-mini",                  object: "model", created: 1740000000, owned_by: "openai" },
  ],
};

const ANTHROPIC_MODELS_RESPONSE = {
  data: [
    {
      type: "model",
      id: "claude-opus-4-6",
      display_name: "Claude Opus 4.6",
      created_at: "2025-11-01T00:00:00Z",
    },
    {
      type: "model",
      id: "claude-opus-4-5",
      display_name: "Claude Opus 4.5",
      created_at: "2025-10-01T00:00:00Z",
    },
    {
      type: "model",
      id: "claude-opus-4-1",
      display_name: "Claude Opus 4.1",
      created_at: "2025-06-01T00:00:00Z",
    },
    {
      type: "model",
      id: "claude-sonnet-4-6",
      display_name: "Claude Sonnet 4.6",
      created_at: "2025-11-01T00:00:00Z",
    },
    {
      type: "model",
      id: "claude-sonnet-4-5",
      display_name: "Claude Sonnet 4.5",
      created_at: "2025-10-01T00:00:00Z",
    },
    {
      type: "model",
      id: "claude-haiku-4-5",
      display_name: "Claude Haiku 4.5",
      created_at: "2025-10-01T00:00:00Z",
    },
  ],
  has_more: false,
  first_id: "claude-opus-4-6",
  last_id: "claude-haiku-4-5",
};

const GEMINI_MODELS_RESPONSE = {
  models: [
    {
      name: "models/gemini-3.1-pro-preview",
      displayName: "Gemini 3.1 Pro Preview",
      description: "Latest and most powerful model for agentic workflows and vibe-coding.",
      supportedGenerationMethods: ["generateContent", "streamGenerateContent", "countTokens"],
    },
    {
      name: "models/gemini-3-pro-preview",
      displayName: "Gemini 3 Pro Preview",
      description: "Powerful model for agentic workflows and vibe-coding.",
      supportedGenerationMethods: ["generateContent", "streamGenerateContent", "countTokens"],
    },
    {
      name: "models/gemini-3-flash-preview",
      displayName: "Gemini 3 Flash Preview",
      description: "Hybrid reasoning model good for daily use and high-volume tasks.",
      supportedGenerationMethods: ["generateContent", "streamGenerateContent", "countTokens"],
    },
    {
      name: "models/gemini-3-pro-image-preview",
      displayName: "Gemini 3 Pro Image Preview",
      description: "Thinking model for high-quality image generation tasks.",
      supportedGenerationMethods: ["generateContent", "streamGenerateContent"],
    },
    {
      name: "models/gemini-2.5-pro",
      displayName: "Gemini 2.5 Pro",
      description: "Excels at coding and complex reasoning tasks.",
      supportedGenerationMethods: ["generateContent", "streamGenerateContent", "countTokens"],
    },
    {
      name: "models/gemini-2.5-flash",
      displayName: "Gemini 2.5 Flash",
      description: "Hybrid reasoning model good for daily use and high-volume tasks.",
      supportedGenerationMethods: ["generateContent", "streamGenerateContent", "countTokens"],
    },
    {
      name: "models/gemini-2.5-flash-image",
      displayName: "Gemini 2.5 Flash Image",
      description: "Native image generation model optimised for speed.",
      supportedGenerationMethods: ["generateContent", "streamGenerateContent"],
    },
  ],
};

const OPENROUTER_MODELS_RESPONSE = {
  object: "list",
  data: [
    { id: "meta-llama/llama-3.3-70b-instruct",  object: "model", created: 1734480000 },
    { id: "meta-llama/llama-3.1-405b-instruct", object: "model", created: 1722816000 },
    { id: "mistralai/mistral-large",             object: "model", created: 1708992000 },
    { id: "mistralai/mixtral-8x22b-instruct",   object: "model", created: 1713916800 },
    { id: "qwen/qwen-2.5-72b-instruct",         object: "model", created: 1727308800 },
    { id: "deepseek/deepseek-r1",               object: "model", created: 1737331200 },
    { id: "x-ai/grok-3",                        object: "model", created: 1740614400 },
    { id: "google/gemma-3-27b-it",              object: "model", created: 1741046400 },
  ],
  _note: "OpenRouter provides access to many more models. See https://openrouter.ai/api/v1/models for the complete list. Use the full model id (e.g. 'meta-llama/llama-3.3-70b-instruct') in your requests.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Unsupported path interceptor definitions
// ─────────────────────────────────────────────────────────────────────────────

interface NotSupportedRule {
  pattern: string | RegExp;
  message: string;
}

const OPENAI_SUPPORTED_ENDPOINTS = [
  "POST /openai/chat/completions  (or /openai/v1/chat/completions)",
  "POST /openai/responses",
  "POST /openai/images/generations",
  "POST /openai/images/edits",
  "POST /openai/audio/transcriptions",
  "GET  /openai/models  (or /openai/v1/models)",
];

const ANTHROPIC_SUPPORTED_ENDPOINTS = [
  "POST /anthropic/v1/messages",
  "GET  /anthropic/v1/models",
];

const GEMINI_SUPPORTED_ENDPOINTS = [
  "POST /gemini/models/{model}:generateContent",
  "POST /gemini/models/{model}:streamGenerateContent",
  "GET  /gemini/models",
];

const OPENROUTER_SUPPORTED_ENDPOINTS = [
  "POST /openrouter/chat/completions",
  "GET  /openrouter/models",
];

const UNSUPPORTED_RULES: Record<string, NotSupportedRule[]> = {
  openai: [
    {
      pattern: /^\/embeddings/,
      message:
        "Embeddings API is not supported by Replit AI Integrations. Use a different provider or supply your own OpenAI API key for embeddings.",
    },
    {
      pattern: /^\/fine_tuning/,
      message: "Fine-tuning API is not supported by Replit AI Integrations.",
    },
    {
      pattern: /^\/files/,
      message: "Files API is not supported by Replit AI Integrations.",
    },
    {
      pattern: /^\/images\/variations/,
      message:
        "Image variations are not supported. Use POST /openai/images/generations or POST /openai/images/edits instead.",
    },
    {
      pattern: "/audio/speech",
      message:
        "Text-to-speech (speech API) is not supported by Replit AI Integrations. For voice interactions, use gpt-audio model via POST /openai/chat/completions.",
    },
  ],
  anthropic: [
    {
      pattern: /^\/v1\/messages\/batches/,
      message: "Anthropic Batch API is not supported by Replit AI Integrations.",
    },
    {
      pattern: /^\/v1\/files/,
      message: "Anthropic Files API is not supported by Replit AI Integrations.",
    },
  ],
  gemini: [
    {
      pattern: /embed/i,
      message:
        "Gemini Embeddings API is not supported by Replit AI Integrations. Use generateContent for text tasks.",
    },
    {
      pattern: /^\/files/,
      message:
        "Gemini Files API is not supported by Replit AI Integrations. Inline base64 data (up to 8 MB per chunk) is the only supported input method.",
    },
  ],
  openrouter: [
    {
      pattern: /^\/embeddings/,
      message: "Embeddings API is not supported via OpenRouter through this proxy.",
    },
    {
      pattern: /^\/images/,
      message: "Image generation is not supported via OpenRouter through this proxy.",
    },
    {
      pattern: /^\/audio/,
      message: "Audio API is not supported via OpenRouter through this proxy.",
    },
  ],
};

const SUPPORTED_ENDPOINTS_MAP: Record<string, string[]> = {
  openai: OPENAI_SUPPORTED_ENDPOINTS,
  anthropic: ANTHROPIC_SUPPORTED_ENDPOINTS,
  gemini: GEMINI_SUPPORTED_ENDPOINTS,
  openrouter: OPENROUTER_SUPPORTED_ENDPOINTS,
};

// ─────────────────────────────────────────────────────────────────────────────
// Static model responses per provider
// ─────────────────────────────────────────────────────────────────────────────

const STATIC_MODELS: Record<string, unknown> = {
  openai: OPENAI_MODELS_RESPONSE,
  anthropic: ANTHROPIC_MODELS_RESPONSE,
  gemini: GEMINI_MODELS_RESPONSE,
  openrouter: OPENROUTER_MODELS_RESPONSE,
};

// ─────────────────────────────────────────────────────────────────────────────
// Provider config
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Router factory
// ─────────────────────────────────────────────────────────────────────────────

function createProviderRouter(providerName: string): IRouter {
  const config = PROVIDERS[providerName];
  const router: IRouter = Router();

  router.use(requireProxyAuth);

  // ── A. OpenAI /v1/ path normalisation ────────────────────────────────────
  // Strip the leading /v1 segment so that clients configured with
  // baseURL = "https://host/openai/v1" work identically to those using
  // baseURL = "https://host/openai". Both /v1/chat/completions and
  // /chat/completions are forwarded to the modelfarm as /chat/completions.
  if (providerName === "openai") {
    router.use((req, _res, next) => {
      if (req.url.startsWith("/v1")) {
        req.url = req.url.slice(3) || "/";
      }
      next();
    });
  }

  // ── B. Static model list ──────────────────────────────────────────────────
  // Serve a hardcoded list of available models (sourced from Replit AI
  // Integrations skill docs). The modelfarm does not support the models
  // listing endpoint so we handle it locally.
  const modelsPayload = STATIC_MODELS[providerName];
  if (modelsPayload) {
    const modelPath =
      providerName === "anthropic"
        ? "/v1/models"
        : "/models";

    router.get(modelPath, (_req, res) => {
      res.json(modelsPayload);
    });

    if (providerName === "openrouter") {
      router.get("/api/v1/models", (_req, res) => {
        res.json(modelsPayload);
      });
    }
  }

  // ── C. Unsupported capability interceptors ────────────────────────────────
  const rules = UNSUPPORTED_RULES[providerName] ?? [];
  const supportedEndpoints = SUPPORTED_ENDPOINTS_MAP[providerName] ?? [];

  for (const rule of rules) {
    router.all(rule.pattern as string, (_req, res) => {
      res.status(501).json({
        error: {
          type: "not_supported",
          message: rule.message,
          supported_endpoints: supportedEndpoints,
        },
      });
    });
  }

  // ── D. Catch-all: transparent proxy to modelfarm ──────────────────────────
  router.all(/(.*)/, async (req: Request, res: Response): Promise<void> => {
    const baseUrl = process.env[config.baseUrlEnv];
    const apiKey = process.env[config.apiKeyEnv];

    if (!baseUrl || !apiKey) {
      res.status(500).json({
        error: `Provider ${providerName} is not configured (missing ${config.baseUrlEnv} or ${config.apiKeyEnv})`,
      });
      return;
    }

    // req.url is already normalised (OpenAI /v1/ stripped by middleware above)
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
      hasBody && req.body instanceof Buffer && req.body.length > 0
        ? req.body
        : undefined;

    try {
      const upstream = await fetch(upstreamUrl, {
        method,
        headers: upstreamHeaders,
        body: bodyBuffer,
      });

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
  });

  return router;
}

export const openaiRouter = createProviderRouter("openai");
export const anthropicRouter = createProviderRouter("anthropic");
export const geminiRouter = createProviderRouter("gemini");
export const openrouterRouter = createProviderRouter("openrouter");
