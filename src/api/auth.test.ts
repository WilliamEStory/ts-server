import { beforeAll, describe, expect, it } from "vitest";
import { checkPasswordHash, hashPassword, makeJWT, validateJWT } from "./auth";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for the incorrect password", async () => {
    const result = await checkPasswordHash(password2, hash1);
    expect(result).toBe(false);
  });
});

describe("JWT", () => {
  const secret = "secret";

  it("should generate a valid JWT", () => {
    const token = makeJWT("user1", 60, secret);
    expect(token).toBeDefined();
  });

  it("should validate a valid JWT", () => {
    const token = makeJWT("user1", 60, secret);
    const result = validateJWT(token, secret);
    expect(result).toBe("user1");
  });

  it("should throw an error for an invalid JWT", () => {
    expect(() => validateJWT("invalid", secret)).toThrow();
  });
})