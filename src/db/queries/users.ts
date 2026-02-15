import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, refreshTokens, users } from "../schema.js";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function deleteAllUsers() {
  await db.delete(users);
}

export async function getUserByEmail(email: string) {
  const userRows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (userRows.length === 0) {
    return;
  }

  return userRows[0];
}

export async function getUserFromRefreshToken(token: string) {
  const [result] = await db
    .select({ user: users })
    .from(users)
    .innerJoin(refreshTokens, eq(users.id, refreshTokens.userId))
    .where(
      and(
        eq(refreshTokens.token, token),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return result;
}

export async function updateUser(id: string, user: NewUser) {
  const [result] = await db
    .update(users)
    .set(user)
    .where(eq(users.id, id))
    .returning();
  return result;
}

export async function getUserById(id: string) {
  const [result] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result;
}

export async function upgradeUserToChirpyRed(id: string) {
  const [result] = await db
    .update(users)
    .set({ isChirpyRed: true })
    .where(eq(users.id, id))
    .returning();
  return result;
}