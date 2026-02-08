import type { Request, Response } from "express";

import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";

const BANNED_WORDS = ["kerfuffle", "sharbert", "fornax"];

export async function validateChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  let params = req.body as parameters;

  console.log("Received request body:", params);

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

  respondWithJSON(res, 200, {
    cleanedBody,
  });
}