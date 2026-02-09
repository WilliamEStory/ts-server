import { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { respondWithJSON } from "./json.js";

export async function postUser(req: Request, res: Response) {
  const { email } = req.body;

  const user = await createUser({
    email,
  });

  respondWithJSON(res, 201, user);
}