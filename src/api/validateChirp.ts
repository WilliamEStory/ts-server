import type { Request, Response } from "express";

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
    throw new Error("Chirp is too long");
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