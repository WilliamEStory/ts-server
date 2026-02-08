import express from "express";

import { handlerMetrics } from "./api/admin/metrics.js";
import { handlerReset } from "./api/admin/reset.js";
import { handlerReadiness } from "./api/readiness.js";
import { validateChirp } from "./api/validateChirp.js";
import { middlewareError } from "./middleware/middlewareError.js";
import { middlewareLogResponses } from "./middleware/middlewareLogging.js";
import { middlewareMetricsInc } from "./middleware/middlewareMetricsInc.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc);

app.use("/app", express.static("./src/app"));

app.get("/api/healthz", (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.post("/api/validate_chirp", (req, res, next) => {
  Promise.resolve(validateChirp(req, res)).catch(next);
});

app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlerReset(req, res)).catch(next);
});
app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handlerMetrics(req, res)).catch(next);
});

app.use(middlewareError);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
