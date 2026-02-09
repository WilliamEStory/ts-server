import type { Request, Response } from "express";

import { createChirp, getAllChirps, getChirpById } from "../db/queries/chirps.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";

const BANNED_WORDS = ["kerfuffle", "sharbert", "fornax"];

export async function postChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
    userId: string;
  };

  let params = req.body as parameters;

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
    userId: params.userId,
  });

  respondWithJSON(res, 201, chirp);
}

export async function getChirps(req: Request, res: Response) {
  const chirps = await getAllChirps();
  respondWithJSON(res, 200, chirps);
}

export async function getChirp(req: Request, res: Response) {
  type parameters = {
    chirpId: string;
  };

  let params = req.params as parameters;

  const chirpId = params.chirpId;
  const chirp = await getChirpById(chirpId);
  respondWithJSON(res, 200, chirp);
}