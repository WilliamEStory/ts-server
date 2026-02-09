import express from "express";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { config } from "./config.js";

import { handlerMetrics } from "./api/admin/metrics.js";
import { handlerReset } from "./api/admin/reset.js";
import { handlerReadiness } from "./api/readiness.js";
import { validateChirp } from "./api/validateChirp.js";
import { middlewareError } from "./middleware/middlewareError.js";
import { middlewareLogResponses } from "./middleware/middlewareLogging.js";
import { middlewareMetricsInc } from "./middleware/middlewareMetricsInc.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

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

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});