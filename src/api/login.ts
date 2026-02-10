import { Request, Response } from "express";
import { UserResponse } from "src/db/schema.js";
import { getUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash } from "./auth.js";
import { respondWithJSON } from "./json.js";

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
  respondWithJSON(res, 200, userWithoutPassword satisfies UserResponse);
}