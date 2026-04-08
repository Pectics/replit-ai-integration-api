import { Router, type IRouter, type Request, type Response } from "express";
import { requireProxyAuth, notImplemented, proxyRequest, probeAndProxy } from "./proxy";
import { ANTHROPIC_MODELS, findAnthropicModel } from "./model-catalogs";

const router: IRouter = Router();
router.use(requireProxyAuth);

const NOT_SUPPORTED =
  "This capability is not available through Replit AI Integrations for Anthropic. See /info for supported endpoints.";

router.get("/v1/models", (_req: Request, res: Response): void => {
  res.json({
    data: ANTHROPIC_MODELS,
    has_more: false,
    first_id: ANTHROPIC_MODELS[0]?.id ?? null,
    last_id: ANTHROPIC_MODELS[ANTHROPIC_MODELS.length - 1]?.id ?? null,
  });
});

router.get("/v1/models/:modelId", (req: Request, res: Response): void => {
  const modelId = String(req.params.modelId);
  const model = findAnthropicModel(modelId);
  if (!model) {
    res.status(404).json({ type: "error", error: { type: "not_found_error", message: `Model '${modelId}' not found` } });
    return;
  }
  res.json(model);
});

router.post("/v1/messages/count_tokens", (req: Request, res: Response) =>
  probeAndProxy(req, res, "anthropic", `${NOT_SUPPORTED} (count_tokens is not supported by this integration)`),
);

router.all(/^\/v1\/messages\/batches(\/.*)?$/, notImplemented(`${NOT_SUPPORTED} (Batch API is not supported)`));
router.all(/^\/v1\/files(\/.*)?$/, notImplemented(`${NOT_SUPPORTED} (Files API is not supported)`));
router.all(/^\/v1\/admin(\/.*)?$/, notImplemented(`${NOT_SUPPORTED} (Admin API is not supported)`));

router.post("/v1/messages", (req: Request, res: Response) => proxyRequest(req, res, "anthropic"));
router.post("/v1/complete", (req: Request, res: Response) => proxyRequest(req, res, "anthropic"));

router.all(/(.*)/, (req: Request, res: Response) => proxyRequest(req, res, "anthropic"));

export default router;
