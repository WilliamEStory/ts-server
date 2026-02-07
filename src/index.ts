import express from "express";

import { handlerMetrics } from "./api/admin/metrics.js";
import { handlerReset } from "./api/admin/reset.js";
import { handlerReadiness } from "./api/readiness.js";
import { validateChirp } from "./api/validateChirp.js";
import { middlewareLogResponses } from "./middleware/middlewareLogging.js";
import { middlewareMetricsInc } from "./middleware/middlewareMetricsInc.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc);

app.use("/app", express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", validateChirp);

app.post("/admin/reset", handlerReset);
app.get("/admin/metrics", handlerMetrics);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
