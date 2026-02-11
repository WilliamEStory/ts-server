import { Request, Response } from "express";
import { UserResponse } from "src/db/schema.js";
import { config } from "../config.js";
import { getUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash, makeJWT } from "./auth.js";
import { respondWithJSON } from "./json.js";

type LoginResponse = UserResponse & {
  token: string;
};

export async function login(req: Request, res: Response) {
  type RequestBody = {
    email: string;
    password: string;
    expiresInSeconds?: number;
  };

  const { email, password, expiresInSeconds } = req.body as RequestBody;

  const user = await getUserByEmail(email);
  if (!user) {
    respondWithJSON(res, 401, {
      message: "Invalid credentials",
    });
    return;
  }

  const isPasswordValid = await checkPasswordHash(password, user.hashedPassword);
  if (!isPasswordValid) {
    respondWithJSON(res, 401, {
      message: "Invalid credentials",
    });
    return;
  }

  const { hashedPassword: _, ...userWithoutPassword } = user;

  const expiresIn = expiresInSeconds && expiresInSeconds < config.jwt.defaultDuration ? expiresInSeconds : config.jwt.defaultDuration;
  const token = makeJWT(userWithoutPassword.id, expiresIn, config.jwt.secret);

  respondWithJSON(res, 200, {
    ...userWithoutPassword,
    token,
  } satisfies LoginResponse);
}