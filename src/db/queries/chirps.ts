import { asc } from "drizzle-orm";
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