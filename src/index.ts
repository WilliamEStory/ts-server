import express from "express";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { config } from "./config.js";

import { handlerMetrics } from "./api/admin/metrics.js";
import { handlerReset } from "./api/admin/reset.js";
import { getChirp, getChirps, postChirp } from "./api/chirps.js";
import { handlerReadiness } from "./api/readiness.js";
import { postUser } from "./api/users.js";
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

//admin endpoints
app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlerReset(req, res)).catch(next);
});
app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handlerMetrics(req, res)).catch(next);
});

// users endpoints
app.post("/api/users", (req, res, next) => {
  Promise.resolve(postUser(req, res)).catch(next);
});

// chirps endpoints
app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(postChirp(req, res)).catch(next);
})
app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(getChirps(req, res)).catch(next);
})
app.get("/api/chirps/:chirpId", (req, res, next) => {
  Promise.resolve(getChirp(req, res)).catch(next);
})

app.use(middlewareError);

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});