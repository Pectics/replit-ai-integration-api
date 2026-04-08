import { Router, type IRouter, type Request, type Response } from "express";
import { requireProxyAuth, notImplemented, proxyRequest } from "./proxy";
import { OPENAI_MODELS, findOpenAIModel } from "./model-catalogs";

const router: IRouter = Router();
router.use(requireProxyAuth);

const NOT_SUPPORTED =
  "This capability is not available through Replit AI Integrations for OpenAI. See /info for supported endpoints.";

router.get("/models", (_req: Request, res: Response): void => {
  res.json({ object: "list", data: OPENAI_MODELS });
});

router.get("/models/:modelId", (req: Request, res: Response): void => {
  const model = findOpenAIModel(req.params.modelId);
  if (!model) {
    res.status(404).json({ error: { message: `Model '${req.params.modelId}' not found`, type: "invalid_request_error", code: "model_not_found" } });
    return;
  }
  res.json(model);
});

router.post("/embeddings", notImplemented(`${NOT_SUPPORTED} (embeddings are not supported)`));
router.post("/audio/speech", notImplemented(`${NOT_SUPPORTED} (TTS / speech output is not supported)`));
router.post("/audio/translations", notImplemented(`${NOT_SUPPORTED} (audio translations are not supported; use /audio/transcriptions instead)`));
router.post("/images/variations", notImplemented(`${NOT_SUPPORTED} (image variations are not supported; use /images/generations or /images/edits)`));
router.post("/moderations", notImplemented(`${NOT_SUPPORTED} (moderations are not supported)`));

router.all("/files", notImplemented(`${NOT_SUPPORTED} (files API is not supported)`));
router.all("/files/:fileId", notImplemented(`${NOT_SUPPORTED} (files API is not supported)`));
router.all("/files/:fileId/content", notImplemented(`${NOT_SUPPORTED} (files API is not supported)`));

router.all("/fine_tuning/jobs", notImplemented(`${NOT_SUPPORTED} (fine-tuning is not supported)`));
router.all("/fine_tuning/jobs/:jobId", notImplemented(`${NOT_SUPPORTED} (fine-tuning is not supported)`));
router.all("/fine_tuning/jobs/:jobId/events", notImplemented(`${NOT_SUPPORTED} (fine-tuning is not supported)`));
router.all("/fine_tuning/jobs/:jobId/checkpoints", notImplemented(`${NOT_SUPPORTED} (fine-tuning is not supported)`));

router.all("/batches", notImplemented(`${NOT_SUPPORTED} (batch API is not supported)`));
router.all("/batches/:batchId", notImplemented(`${NOT_SUPPORTED} (batch API is not supported)`));

router.all("/assistants", notImplemented(`${NOT_SUPPORTED} (Assistants API is not supported)`));
router.all("/assistants/:assistantId", notImplemented(`${NOT_SUPPORTED} (Assistants API is not supported)`));

router.all("/threads", notImplemented(`${NOT_SUPPORTED} (Threads API is not supported)`));
router.all("/threads/:threadId", notImplemented(`${NOT_SUPPORTED} (Threads API is not supported)`));
router.all("/threads/:threadId/messages", notImplemented(`${NOT_SUPPORTED} (Threads API is not supported)`));
router.all("/threads/:threadId/messages/:messageId", notImplemented(`${NOT_SUPPORTED} (Threads API is not supported)`));
router.all("/threads/:threadId/runs", notImplemented(`${NOT_SUPPORTED} (Threads API is not supported)`));
router.all("/threads/:threadId/runs/:runId", notImplemented(`${NOT_SUPPORTED} (Threads API is not supported)`));

router.all("/vector_stores", notImplemented(`${NOT_SUPPORTED} (Vector Stores API is not supported)`));
router.all("/vector_stores/:vectorStoreId", notImplemented(`${NOT_SUPPORTED} (Vector Stores API is not supported)`));

router.all("/uploads", notImplemented(`${NOT_SUPPORTED} (uploads API is not supported)`));
router.all("/uploads/:uploadId", notImplemented(`${NOT_SUPPORTED} (uploads API is not supported)`));

router.all(/(.*)/, (req: Request, res: Response) => proxyRequest(req, res, "openai"));

export default router;
