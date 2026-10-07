import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import type { ErrorRequestHandler } from "express";
import router from "./routes";
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
app.use(cors({ origin: process.env.APP_ORIGIN ?? false, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);
app.use(((error, req, res, _next) => {
  if (error instanceof SyntaxError && "status" in error && (error as any).status === 400) {
    res.status(400).json({
      success: false,
      error: { code: "INVALID_JSON", message: "Malformed JSON payload in request." },
    });
    return;
  }
  req.log.error({ err: error }, "Unhandled API error");
  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." },
  });
}) satisfies ErrorRequestHandler);

export default app;
