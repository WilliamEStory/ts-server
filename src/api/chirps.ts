import type { Request, Response } from "express";

import { config } from "../config.js";
import { createChirp, deleteChirp as deleteChirpById, getAllChirps, getChirp as getChirpById, getChirpsByAuthorId } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "./auth.js";
import { BadRequestError, NotFoundError, UserForbiddenError } from "./errors.js";
import { respondWithJSON } from "./json.js";

const BANNED_WORDS = ["kerfuffle", "sharbert", "fornax"];

export async function postChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
    userId: string;
  };
  let params = req.body as parameters;

  const token = getBearerToken(req);

  let userJWTId = validateJWT(token, config.jwt.secret);

  if (!userJWTId) {
    throw new UserForbiddenError("User is not allowed to post this chirp");
  }

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  let cleanedBody = params.body;
  for (const word of BANNED_WORDS) {
    if (cleanedBody.toLowerCase().split(" ").includes(word)) {
      cleanedBody = cleanedBody.replace(new RegExp(word, "gi"), "****");
    }
  }

  const chirp = await createChirp({
    body: cleanedBody,
    userId: userJWTId,
  });

  respondWithJSON(res, 201, chirp);
}

export async function getChirps(req: Request, res: Response) {
  const authorId = req.query.authorId || "";
  const sortDir = req.query.sort || "asc";

  if (sortDir !== "asc" && sortDir !== "desc") {
    throw new BadRequestError("Invalid sort direction");
  }

  if (authorId && typeof authorId === "string") {
    const chirps = await getChirpsByAuthorId(authorId, sortDir);
    respondWithJSON(res, 200, chirps);
  } else {
    const chirps = await getAllChirps(sortDir);
    respondWithJSON(res, 200, chirps);
  }
}

export async function getChirp(req: Request, res: Response) {
  type parameters = {
    chirpId: string;
  };

  let params = req.params as parameters;

  const chirpId = params.chirpId;
  const chirp = await getChirpById(chirpId);

  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
  }

  respondWithJSON(res, 200, chirp);
}

export async function deleteChirp(req: Request, res: Response) {
  const { chirpId } = req.params;

  if (typeof chirpId !== "string") {
    throw new BadRequestError("Invalid chirp ID");
  }

  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);

  const chirp = await getChirpById(chirpId);

  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
  }

  if (chirp.userId !== userId) {
    throw new UserForbiddenError("You can't delete this chirp");
  }

  const deleted = await deleteChirpById(chirpId);
  if (!deleted) {
    throw new Error(`Failed to delete chirp with chirpId: ${chirpId}`);
  }

  res.status(204).send();
}