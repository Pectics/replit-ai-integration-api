import { Router, type IRouter, type Request, type Response } from "express";
import { requireProxyAuth, notImplemented, proxyRequest } from "./proxy";
import { GEMINI_MODELS, findGeminiModel } from "./model-catalogs";

const router: IRouter = Router();
router.use(requireProxyAuth);

const NOT_SUPPORTED =
  "This capability is not available through Replit AI Integrations for Gemini. See /info for supported endpoints.";

const BLOCKED_ACTIONS = new Set(["embedContent", "batchEmbedContents", "generateAnswer", "generateAnswerStream"]);

router.get("/models", (_req: Request, res: Response): void => {
  res.json({ models: GEMINI_MODELS });
});

router.get("/models/:modelId", (req: Request, res: Response): void => {
  const model = findGeminiModel(req.params.modelId);
  if (!model) {
    res.status(404).json({ error: { code: 404, message: `Model '${req.params.modelId}' not found`, status: "NOT_FOUND" } });
    return;
  }
  res.json(model);
});

router.post("/models/:modelAndAction", (req: Request, res: Response) => {
  const { modelAndAction } = req.params;
  const colonIdx = modelAndAction.lastIndexOf(":");
  const action = colonIdx >= 0 ? modelAndAction.slice(colonIdx + 1) : "";

  if (BLOCKED_ACTIONS.has(action)) {
    notImplemented(`${NOT_SUPPORTED} (${action} / embeddings are not supported)`)(req, res);
    return;
  }

  return proxyRequest(req, res, "gemini");
});

router.all("/files", notImplemented(`${NOT_SUPPORTED} (Files API is not supported)`));
router.all("/files/:fileId", notImplemented(`${NOT_SUPPORTED} (Files API is not supported)`));

router.all("/tunedModels", notImplemented(`${NOT_SUPPORTED} (fine-tuning / tuned models are not supported)`));
router.all("/tunedModels/:modelId", notImplemented(`${NOT_SUPPORTED} (fine-tuning / tuned models are not supported)`));

router.all("/cachedContents", notImplemented(`${NOT_SUPPORTED} (context caching is not supported)`));
router.all("/cachedContents/:cacheId", notImplemented(`${NOT_SUPPORTED} (context caching is not supported)`));

router.all(/(.*)/, (req: Request, res: Response) => proxyRequest(req, res, "gemini"));

export default router;
