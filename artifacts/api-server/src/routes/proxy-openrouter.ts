import { Router, type IRouter, type Request, type Response } from "express";
import { requireProxyAuth, notImplemented, proxyRequest, probeAndProxy } from "./proxy";

const router: IRouter = Router();
router.use(requireProxyAuth);

const NOT_SUPPORTED =
  "This capability is not available through Replit AI Integrations for OpenRouter. See /info for supported endpoints.";

router.get("/api/v1/models", (req: Request, res: Response) =>
  probeAndProxy(req, res, "openrouter", `${NOT_SUPPORTED} (GET /models is not supported by this integration)`),
);

router.post("/api/v1/completions", notImplemented(`${NOT_SUPPORTED} (legacy text completions are not supported; use /chat/completions)`));
router.post("/api/v1/embeddings", notImplemented(`${NOT_SUPPORTED} (embeddings are not supported)`));
router.post("/api/v1/images/generations", notImplemented(`${NOT_SUPPORTED} (image generation is not supported via OpenRouter integration)`));

router.all(/^\/api\/v1\/audio(\/.*)?$/, notImplemented(`${NOT_SUPPORTED} (audio is not supported)`));
router.get("/api/v1/generation", notImplemented(`${NOT_SUPPORTED} (generation tracking endpoint is not supported)`));
router.get("/api/v1/credits", notImplemented(`${NOT_SUPPORTED} (credits endpoint is not supported)`));
router.all(/^\/api\/v1\/auth(\/.*)?$/, notImplemented(`${NOT_SUPPORTED} (auth endpoint is not supported)`));

router.post("/api/v1/chat/completions", (req: Request, res: Response) => proxyRequest(req, res, "openrouter"));

router.all(/(.*)/, (req: Request, res: Response) => proxyRequest(req, res, "openrouter"));

export default router;
