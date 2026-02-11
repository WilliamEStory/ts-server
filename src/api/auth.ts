import * as argon2 from "argon2";
import { Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";

export type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;
const TOKEN_ISSUER = "chirpy";


export async function hashPassword(password: string) {
  const hash = await argon2.hash(password);
  return hash;
}

export async function checkPasswordHash(password: string, hash: string) {
  return await argon2.verify(hash, password);
}

export function validateJWT(tokenString: string, secret: string) {
  let decoded: payload;
  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (e) {
    throw new UserNotAuthenticatedError("Invalid token");
  }

  if (decoded.iss !== TOKEN_ISSUER) {
    throw new UserNotAuthenticatedError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new UserNotAuthenticatedError("No user ID in token");
  }

  return decoded.sub;
}

export function makeJWT(userID: string, expiresIn: number, secret: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresIn;
  const token = jwt.sign(
    {
      iss: TOKEN_ISSUER,
      sub: userID,
      iat: issuedAt,
      exp: expiresAt,
    } satisfies payload,
    secret,
    { algorithm: "HS256" },
  );

  return token;
}

export function getBearerToken(req: Request) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new BadRequestError("No authorization header");
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer") {
    throw new BadRequestError("Invalid token type");
  }

  return token;
}