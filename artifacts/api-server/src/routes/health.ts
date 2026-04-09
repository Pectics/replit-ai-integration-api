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
        sdkBaseUrl: "/openai/v1",
        note: "Set SDK baseURL to '/openai/v1'. Reasoning models (gpt-5-nano, o4-mini, o3) consume tokens for internal thought — use max_completion_tokens ≥ 200 or prefer gpt-4o-mini for general use.",
        passthrough: [
          "POST /openai/v1/chat/completions",
          "POST /openai/v1/responses",
          "POST /openai/v1/images/generations",
          "POST /openai/v1/images/edits",
          "POST /openai/v1/audio/transcriptions",
        ],
        fakeResponse: [
          "GET /openai/v1/models → static model list",
          "GET /openai/v1/models/{model_id} → static model object or 404",
        ],
        notImplemented: [
          "POST /openai/v1/embeddings",
          "POST /openai/v1/audio/speech",
          "POST /openai/v1/audio/translations",
          "POST /openai/v1/images/variations",
          "POST /openai/v1/moderations",
          "ALL  /openai/v1/files/*",
          "ALL  /openai/v1/fine_tuning/*",
          "ALL  /openai/v1/batches/*",
          "ALL  /openai/v1/assistants/*",
          "ALL  /openai/v1/threads/*",
          "ALL  /openai/v1/vector_stores/*",
          "ALL  /openai/v1/uploads/*",
        ],
        models: [
          "gpt-5.2", "gpt-5.3-codex", "gpt-5.2-codex", "gpt-5.1", "gpt-5",
          "gpt-5-mini", "gpt-5-nano",
          "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano",
          "gpt-4o", "gpt-4o-mini",
          "o4-mini", "o3", "o3-mini",
          "gpt-image-1", "gpt-audio", "gpt-audio-mini", "gpt-4o-mini-transcribe",
        ],
      },
      anthropic: {
        sdkBaseUrl: "/anthropic",
        note: "Set SDK baseURL to '/anthropic'. The SDK will append /v1/messages automatically.",
        passthrough: [
          "POST /anthropic/v1/messages",
          "POST /anthropic/v1/messages/count_tokens",
        ],
        fakeResponse: [
          "GET /anthropic/v1/models → static model list",
          "GET /anthropic/v1/models/{model_id} → static model object or 404",
        ],
        notImplemented: [
          "ALL  /anthropic/v1/messages/batches/*",
          "ALL  /anthropic/v1/files/*",
          "ALL  /anthropic/v1/admin/*",
        ],
        models: [
          "claude-opus-4-6", "claude-opus-4-5", "claude-opus-4-1",
          "claude-sonnet-4-6", "claude-sonnet-4-5",
          "claude-haiku-4-5",
        ],
      },
      gemini: {
        sdkBaseUrl: "/gemini/v1[beta]",
        note: "Set SDK baseURL to '/gemini/v1[beta]'. The SDK appends /v1/models/{model}:action paths automatically. Thinking models (gemini-2.5-flash, gemini-2.5-pro) — set maxOutputTokens ≥ 1024 to leave room for response after internal thought tokens.",
        passthrough: [
          "POST /gemini/v1/models/{model}:generateContent",
          "POST /gemini/v1/models/{model}:streamGenerateContent",
          "POST /gemini/v1/models/{model}:countTokens",
          "POST /gemini/v1beta/models/{model}:generateContent",
          "POST /gemini/v1beta/models/{model}:streamGenerateContent",
          "POST /gemini/v1beta/models/{model}:countTokens",
        ],
        fakeResponse: [
          "GET /gemini/v1/models → static model list",
          "GET /gemini/v1/models/{model_id} → static model object or 404",
          "GET /gemini/v1beta/models → static model list",
          "GET /gemini/v1beta/models/{model_id} → static model object or 404",
        ],
        notImplemented: [
          "POST /gemini/v1/models/{model}:embedContent",
          "POST /gemini/v1/models/{model}:batchEmbedContents",
          "POST /gemini/v1/models/{model}:generateAnswer",
          "ALL  /gemini/v1/files/*",
          "ALL  /gemini/v1/tunedModels/*",
          "ALL  /gemini/v1/cachedContents/*",
          "POST /gemini/v1beta/models/{model}:embedContent",
          "POST /gemini/v1beta/models/{model}:batchEmbedContents",
          "POST /gemini/v1beta/models/{model}:generateAnswer",
          "ALL  /gemini/v1beta/files/*",
          "ALL  /gemini/v1beta/tunedModels/*",
          "ALL  /gemini/v1beta/cachedContents/*",
        ],
        models: [
          "gemini-3.1-pro-preview", "gemini-3-pro-preview", "gemini-3-flash-preview",
          "gemini-3-pro-image-preview",
          "gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-image",
        ],
      },
      openrouter: {
        sdkBaseUrl: "/openrouter/v1",
        note: "Set SDK baseURL to '/openrouter/v1'. The SDK appends endpoint paths directly (e.g. /chat/completions). Access to long-tail models from xAI, Meta, Mistral, Qwen, DeepSeek, and more.",
        passthrough: [
          "POST /openrouter/v1/chat/completions",
          "GET  /openrouter/v1/models (forwarded to OpenRouter API)",
        ],
        fakeResponse: [],
        notImplemented: [
          "POST /openrouter/v1/completions (legacy)",
          "POST /openrouter/v1/embeddings",
          "POST /openrouter/v1/images/generations",
          "ALL  /openrouter/v1/audio/*",
          "GET  /openrouter/v1/generation",
          "GET  /openrouter/v1/credits",
          "ALL  /openrouter/v1/auth/*",
        ],
        models: "Any model on https://openrouter.ai/api/v1/models — use GET /openrouter/v1/models to list them",
      },
    },
    streaming: "SSE (stream: true) and chunked transfer encoding are supported end-to-end without buffering.",
  });
});

export default router;
