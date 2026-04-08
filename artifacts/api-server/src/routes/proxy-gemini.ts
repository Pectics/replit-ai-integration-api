import { Router, type IRouter, type Request, type Response } from "express";
import { requireProxyAuth, notImplemented, proxyRequest, probeAndProxy } from "./proxy";
import { GEMINI_MODELS, findGeminiModel } from "./model-catalogs";

const router: IRouter = Router();
router.use(requireProxyAuth);

const NOT_SUPPORTED =
  "This capability is not available through Replit AI Integrations for Gemini. See /info for supported endpoints.";

const BLOCKED_ACTIONS = new Set(["embedContent", "batchEmbedContents", "generateAnswer", "generateAnswerStream"]);

router.get("/v1/models", (_req: Request, res: Response): void => {
  res.json({ models: GEMINI_MODELS });
});

router.get(/^\/v1\/models\/(.+)$/, (req: Request, res: Response): void => {
  const rawId = String(req.params[0]);
  const normalizedId = rawId.replace(/^v1\/models\//, "");
  const model = findGeminiModel(normalizedId);
  if (!model) {
    res.status(404).json({ error: { code: 404, message: `Model '${rawId}' not found`, status: "NOT_FOUND" } });
    return;
  }
  res.json(model);
});

router.post("/v1/models/:modelAndAction", (req: Request, res: Response) => {
  const modelAndAction = String(req.params.modelAndAction);
  const colonIdx = modelAndAction.lastIndexOf(":");
  const action = colonIdx >= 0 ? modelAndAction.slice(colonIdx + 1) : "";

  if (BLOCKED_ACTIONS.has(action)) {
    notImplemented(`${NOT_SUPPORTED} (${action} / embeddings are not supported)`)(req, res);
    return;
  }

  if (action === "countTokens") {
    return probeAndProxy(req, res, "gemini", `${NOT_SUPPORTED} (countTokens is not supported by this integration)`);
  }

  return proxyRequest(req, res, "gemini");
});

router.all(/^\/v1\/files(\/.*)?$/, notImplemented(`${NOT_SUPPORTED} (Files API is not supported)`));
router.all(/^\/v1\/tunedModels(\/.*)?$/, notImplemented(`${NOT_SUPPORTED} (fine-tuning / tuned models are not supported)`));
router.all(/^\/v1\/cachedContents(\/.*)?$/, notImplemented(`${NOT_SUPPORTED} (context caching is not supported)`));

router.all(/(.*)/, (req: Request, res: Response) => proxyRequest(req, res, "gemini"));

export default router;
