import { Request, Response } from "express";
import { config } from "../config.js";
import { createUser, updateUser } from "../db/queries/users.js";
import { NewUser, UserResponse } from "../db/schema.js";
import { getBearerToken, hashPassword, validateJWT } from "./auth.js";
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

export async function putUser(req: Request, res: Response) {
  type params = {
    password: string,
    email: string
  }

  const { password, email } = req.body as params;

  if (!password || !email) {
    throw new BadRequestError("Missing required fields");
  }

  const accessToken = getBearerToken(req);
  const userId = validateJWT(accessToken, config.jwt.secret)

  const hashedPassword = await hashPassword(password);

  const user = await updateUser(userId, {
    email,
    hashedPassword,
  } satisfies NewUser);

  if (!user) {
    throw new Error("Could not update user");
  }

  const { hashedPassword: _, ...userResponse } = user;

  respondWithJSON(res, 200, userResponse satisfies UserResponse);
}
