import crypto from "crypto";
import { Request, Response } from "express";
import { config } from "../config.js";
import { createRefreshToken, getRefreshToken, updateRefreshToken } from "../db/queries/refreshTokens.js";
import { getUserByEmail, getUserFromRefreshToken } from "../db/queries/users.js";
import { UserResponse } from "../db/schema.js";
import { checkPasswordHash, getBearerToken, makeJWT } from "./auth.js";
import { UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";

type LoginResponse = UserResponse & {
  token: string;
  refreshToken: string;
};

export async function login(req: Request, res: Response) {
  type RequestBody = {
    email: string;
    password: string;
  };

  const { email, password } = req.body as RequestBody;

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

  const token = makeJWT(userWithoutPassword.id, config.jwt.defaultDuration, config.jwt.secret);
  const refreshToken = makeRefreshToken();

  const savedRefreshToken = await createRefreshToken(refreshToken, userWithoutPassword.id);
  if (!savedRefreshToken) {
    throw new UserNotAuthenticatedError("Failed to save refresh token");
  }

  respondWithJSON(res, 200, {
    ...userWithoutPassword,
    token,
    refreshToken,
  } satisfies LoginResponse);
}

export function makeRefreshToken() {
  const token = crypto.randomBytes(32).toString("hex");

  return token;
}

export async function refresh(req: Request, res: Response) {
  let refreshToken = getBearerToken(req);

  const result = await getUserFromRefreshToken(refreshToken);
  if (!result) {
    throw new UserNotAuthenticatedError("Malformed refresh token");
  }

  const { user } = result;
  const accessToken = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);

  respondWithJSON(res, 200, {
    token: accessToken,
  })
}

export async function revokeRefreshToken(req: Request, res: Response) {
  const token = getBearerToken(req);

  const refreshToken = await getRefreshToken(token);

  if (!refreshToken || refreshToken.revokedAt) {
    throw new UserNotAuthenticatedError("Malformed refresh token");
  }

  await updateRefreshToken(token, {
    ...refreshToken,
    revokedAt: new Date(),
  });

  res.status(204).send();
}