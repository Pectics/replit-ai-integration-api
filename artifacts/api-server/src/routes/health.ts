import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/info", (_req, res) => {
  res.json({
    description: "Replit AI Integrations transparent proxy",
    authentication: {
      header: "Authorization",
      scheme: "Bearer <PROXY_API_KEY>",
      note: "Required on all provider routes. /healthz and /info are public.",
    },
    providers: {
      openai: {
        sdkBaseUrl: {
          recommended: "/openai",
          alsoWorks: "/openai/v1",
          note: "The proxy automatically strips the /v1 prefix before forwarding to the modelfarm, so both base URL forms work identically with the OpenAI SDK.",
        },
        sdkExample: "new OpenAI({ baseURL: 'https://your-domain.replit.app/openai', apiKey: '<PROXY_API_KEY>' })",
        supportedApis: [
          "GET  /openai/models  (or /openai/v1/models) — returns static model list",
          "POST /openai/chat/completions  (or /openai/v1/chat/completions)",
          "POST /openai/responses  (or /openai/v1/responses)",
          "POST /openai/images/generations",
          "POST /openai/images/edits",
          "POST /openai/audio/transcriptions",
        ],
        models: [
          "gpt-5.3-codex (Responses API only)",
          "gpt-5.2",
          "gpt-5.2-codex (Responses API only)",
          "gpt-5.1",
          "gpt-5",
          "gpt-5-mini",
          "gpt-5-nano",
          "gpt-4.1",
          "gpt-4.1-mini",
          "gpt-4.1-nano",
          "gpt-4o",
          "gpt-4o-mini",
          "gpt-image-1",
          "gpt-audio",
          "gpt-audio-mini",
          "gpt-4o-mini-transcribe",
          "o4-mini",
          "o3",
          "o3-mini",
        ],
        notes: [
          "Reasoning/thinking models (gpt-5-nano, o4-mini, o3) use tokens for internal thought — set max_completion_tokens ≥ 200 or use gpt-4o-mini for quick tasks.",
          "gpt-5+ models require max_completion_tokens instead of max_tokens.",
          "gpt-image-1 always returns base64; response_format is not configurable.",
        ],
        unsupported: [
          "POST /openai/embeddings — Embeddings API not available",
          "POST /openai/fine_tuning/* — Fine-tuning not available",
          "POST /openai/files/* — Files API not available",
          "POST /openai/images/variations — Use /images/generations or /images/edits",
          "POST /openai/audio/speech — TTS not available; use gpt-audio model via chat/completions",
        ],
      },
      anthropic: {
        sdkBaseUrl: "/anthropic",
        sdkExample: "new Anthropic({ baseURL: 'https://your-domain.replit.app/anthropic', apiKey: '<PROXY_API_KEY>' })",
        supportedApis: [
          "GET  /anthropic/v1/models — returns static model list",
          "POST /anthropic/v1/messages",
        ],
        models: [
          "claude-opus-4-6 (most capable)",
          "claude-opus-4-5",
          "claude-opus-4-1",
          "claude-sonnet-4-6 (recommended for most tasks)",
          "claude-sonnet-4-5",
          "claude-haiku-4-5 (fastest)",
        ],
        unsupported: [
          "POST /anthropic/v1/messages/batches — Batch API not available",
          "POST /anthropic/v1/files/* — Files API not available",
        ],
      },
      gemini: {
        sdkBaseUrl: "/gemini",
        sdkExample: "new GoogleGenAI({ baseUrl: 'https://your-domain.replit.app/gemini', apiKey: '<PROXY_API_KEY>' })",
        supportedApis: [
          "GET  /gemini/models — returns static model list",
          "POST /gemini/models/{model}:generateContent",
          "POST /gemini/models/{model}:streamGenerateContent",
        ],
        models: [
          "gemini-3.1-pro-preview (latest, best for agentic tasks)",
          "gemini-3-pro-preview",
          "gemini-3-flash-preview (hybrid reasoning, recommended)",
          "gemini-3-pro-image-preview (high-quality image generation)",
          "gemini-2.5-pro (coding and complex reasoning)",
          "gemini-2.5-flash (hybrid reasoning, high-volume tasks)",
          "gemini-2.5-flash-image (fast image generation)",
        ],
        notes: [
          "No version prefix in path — use /gemini/models/{model}:generateContent directly.",
          "gemini-2.5-flash and newer are thinking models — set maxOutputTokens ≥ 1024.",
          "Gemini uses role 'model' where other providers use 'assistant'.",
        ],
        unsupported: [
          "POST /gemini/models/{model}:embedContent — Embeddings not available",
          "POST /gemini/files/* — Files API not available; use inline base64 data (max 8 MB per chunk)",
          "Gemini Live API (real-time voice/video) — not available",
        ],
      },
      openrouter: {
        sdkBaseUrl: "/openrouter",
        sdkExample: "new OpenAI({ baseURL: 'https://your-domain.replit.app/openrouter', apiKey: '<PROXY_API_KEY>' })",
        supportedApis: [
          "GET  /openrouter/models  (or /openrouter/api/v1/models) — static list of popular models",
          "POST /openrouter/chat/completions",
        ],
        models: "OpenRouter provides access to many models (Llama, Mistral, Qwen, DeepSeek, Grok, Gemma, and more). The /openrouter/models endpoint returns a curated sample. See https://openrouter.ai/api/v1/models for the full catalog.",
        unsupported: [
          "POST /openrouter/embeddings — not available",
          "POST /openrouter/images/* — image generation not available via OpenRouter",
          "POST /openrouter/audio/* — audio API not available via OpenRouter",
        ],
      },
    },
    streaming: "SSE (stream: true) and chunked transfer are supported end-to-end without buffering for all providers.",
  });
});

export default router;
