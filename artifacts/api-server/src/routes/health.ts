import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

/**
 * GET /info — API usage guide for this transparent proxy.
 *
 * The proxy forwards requests verbatim to Replit AI Integrations (modelfarm).
 * Clients should configure their SDK's baseURL to one of the prefixes below
 * and let the SDK append the endpoint path as usual.
 * All proxy routes require:  Authorization: Bearer <PROXY_API_KEY>
 */
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
        sdkBaseUrl: "/openai",
        supportedApis: [
          "POST /openai/chat/completions",
          "POST /openai/images/generations",
          "POST /openai/images/edits",
          "POST /openai/audio/transcriptions",
          "POST /openai/responses",
        ],
        note: "The modelfarm path does not include a /v1 prefix. Configure the OpenAI SDK baseURL as '/openai' (not '/openai/v1').",
        models: ["gpt-5.2", "gpt-5-nano", "gpt-5-mini", "gpt-image-1", "gpt-4o-mini-transcribe", "o4-mini", "o3"],
      },
      anthropic: {
        sdkBaseUrl: "/anthropic",
        supportedApis: [
          "POST /anthropic/v1/messages",
        ],
        note: "Anthropic SDK appends /v1/messages to the baseURL — use '/anthropic' as baseURL.",
        models: ["claude-sonnet-4-6", "claude-opus-4-6", "claude-haiku-4-5"],
      },
      gemini: {
        sdkBaseUrl: "/gemini",
        supportedApis: [
          "POST /gemini/models/{model}:generateContent",
          "POST /gemini/models/{model}:streamGenerateContent",
        ],
        note: "No version prefix in path. Use model names exactly as listed.",
        models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-3-flash-preview", "gemini-2.5-flash-image"],
      },
      openrouter: {
        sdkBaseUrl: "/openrouter",
        supportedApis: [
          "POST /openrouter/chat/completions",
        ],
        note: "OpenRouter SDK (OpenAI-compatible) appends /chat/completions to the baseURL. Use '/openrouter' as baseURL.",
        models: "Any model available on https://openrouter.ai/api/v1/models",
      },
    },
    streaming: "SSE (stream: true) and chunked transfer are supported end-to-end without buffering.",
    unsupported: ["embeddings", "fine-tuning", "files API", "video I/O", "OpenAI Realtime API", "Gemini Live API"],
  });
});

export default router;
