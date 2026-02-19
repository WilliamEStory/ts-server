import { asc, desc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";

type SortDirection = "asc" | "desc";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db.insert(chirps).values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function deleteAllChirps() {
  return await db.delete(chirps);
}

export async function getAllChirps(sortDir: SortDirection = "asc") {
  return await db.select().from(chirps).orderBy(sortDir === "asc" ? asc(chirps.createdAt) : desc(chirps.createdAt));
}

export async function getChirpsByAuthorId(authorId: string, sortDir: SortDirection = "asc") {
  return await db.select().from(chirps).where(eq(chirps.userId, authorId)).orderBy(sortDir === "asc" ? asc(chirps.createdAt) : desc(chirps.createdAt));
}

export async function getChirp(id: string) {
  const [result] = await db.select().from(chirps).where(eq(chirps.id, id));
  return result;
}

export async function deleteChirp(id: string) {
  const rows = await db.delete(chirps).where(eq(chirps.id, id)).returning();
  return rows.length > 0;
}