import { Request, Response } from "express";
import { NewUser, UserResponse } from "src/db/schema.js";
import { createUser } from "../db/queries/users.js";
import { hashPassword } from "./auth.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";

export async function postUser(req: Request, res: Response) {
  type RequestBody = {
    email: string;
    password: string;
  }

  const { email, password } = req.body as RequestBody;

  if (!email || !password) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(password);

  const user = await createUser({
    email,
    hashedPassword,
  } satisfies NewUser);

  if (!user) {
    throw new Error("Could not create user");
  }

  const { hashedPassword: _, ...userResponse } = user;

  respondWithJSON(res, 201, userResponse satisfies UserResponse);
}