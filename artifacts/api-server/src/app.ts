import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import healthRouter from "./routes/health";
import { openaiRouter, anthropicRouter, geminiRouter, openrouterRouter } from "./routes/proxy";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());

// Raw body parser for all routes (supports all content types including audio up to 50 MB).
// Must be applied before proxy routes so req.body is a Buffer available for forwarding.
app.use(express.raw({ type: "*/*", limit: "50mb" }));

// Health check — no authentication required
app.use(healthRouter);

// AI transparent proxy routes — require Bearer token auth (PROXY_API_KEY)
app.use("/openai", openaiRouter);
app.use("/anthropic", anthropicRouter);
app.use("/gemini", geminiRouter);
app.use("/openrouter", openrouterRouter);

export default app;
