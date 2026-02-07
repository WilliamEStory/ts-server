import type { Request, Response } from "express";

import { respondWithError, respondWithJSON } from "./json.js";

export async function validateChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
  };


  let params = req.body as parameters;

  console.log("Received request body:", params);

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    respondWithError(res, 400, "Chirp is too long");
    return;
  }

  respondWithJSON(res, 200, {
    valid: true,
  });
}