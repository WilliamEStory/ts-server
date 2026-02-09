import { Request, Response } from "express";
import { config } from "../../config.js";
import { deleteAllUsers } from "../../db/queries/users.js";
import { UserForbiddenError } from "../errors.js";
import { respondWithJSON } from "../json.js";

export const handlerReset = async (req: Request, res: Response) => {
  const isDevEnv = config.api.platform === "dev";

  if (!isDevEnv) {
    throw new UserForbiddenError("Forbidden");
  }

  config.api.fileServerHits = 0;

  await deleteAllUsers();

  respondWithJSON(res, 200, {});
}