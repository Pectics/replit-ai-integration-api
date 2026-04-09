import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import healthRouter from "./routes/health";
import openaiRouter from "./routes/proxy-openai";
import anthropicRouter from "./routes/proxy-anthropic";
import geminiRouter from "./routes/proxy-gemini";
import openrouterRouter from "./routes/proxy-openrouter";
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

app.use(express.raw({ type: "*/*", limit: "50mb" }));

app.use(healthRouter);

app.use("/openai/v1", openaiRouter);
app.use("/anthropic", anthropicRouter);
app.use(["/gemini/v1", "/gemini/v1beta"], geminiRouter);
app.use("/openrouter", openrouterRouter);

export default app;
