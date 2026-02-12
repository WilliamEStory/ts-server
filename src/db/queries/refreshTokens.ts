import { eq } from "drizzle-orm";
import { config } from "../../config.js";
import { db } from "../index.js";
import type { NewRefreshToken } from "../schema.js";
import { refreshTokens } from "../schema.js";

export async function getRefreshToken(token: string) {
  const [rows] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
  return rows;
}

export async function createRefreshToken(token: string, userId: string) {
  const [rows] = await db.insert(refreshTokens).values({
    token,
    userId,
    expiresAt: new Date(Date.now() + config.jwt.refreshTokenDuration),
    revokedAt: null,
  }).returning();
  return rows;
}

export async function updateRefreshToken(token: string, updatedToken: NewRefreshToken) {
  return await db.update(refreshTokens).set(updatedToken).where(eq(refreshTokens.token, token));
}