import { Router, type IRouter, type Request, type Response } from "express";
import { requireProxyAuth, notImplemented, proxyRequest, probeAndProxy } from "./proxy";

const router: IRouter = Router();
router.use(requireProxyAuth);

const NOT_SUPPORTED =
  "This capability is not available through Replit AI Integrations for OpenRouter. See /info for supported endpoints.";

router.get("/models", (req: Request, res: Response) =>
  probeAndProxy(req, res, "openrouter", `${NOT_SUPPORTED} (GET /models is not supported by this integration)`),
);

router.post("/completions", notImplemented(`${NOT_SUPPORTED} (legacy text completions are not supported; use /chat/completions)`));
router.post("/embeddings", notImplemented(`${NOT_SUPPORTED} (embeddings are not supported)`));
router.post("/images/generations", notImplemented(`${NOT_SUPPORTED} (image generation is not supported via OpenRouter integration)`));

router.all(/^\/audio(\/.*)?$/, notImplemented(`${NOT_SUPPORTED} (audio is not supported)`));
router.get("/generation", notImplemented(`${NOT_SUPPORTED} (generation tracking endpoint is not supported)`));
router.get("/credits", notImplemented(`${NOT_SUPPORTED} (credits endpoint is not supported)`));
router.all(/^\/auth(\/.*)?$/, notImplemented(`${NOT_SUPPORTED} (auth endpoint is not supported)`));

router.all(/(.*)/, (req: Request, res: Response) => proxyRequest(req, res, "openrouter"));

export default router;
