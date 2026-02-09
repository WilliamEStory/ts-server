import { asc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db.insert(chirps).values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function deleteAllChirps() {
  return await db.delete(chirps);
}

export async function getAllChirps() {
  return await db.select().from(chirps).orderBy(asc(chirps.createdAt));
}

export async function getChirpById(chirpId: string) {
  const chirpRows = await db.select().from(chirps).where(eq(chirps.id, chirpId)).limit(1);
  if (chirpRows.length === 0) {
    return;
  }

  return chirpRows[0];
}