import { Request, Response } from "express";
import { config } from "../../config.js";
import { upgradeUserToChirpyRed } from "../../db/queries/users.js";
import { getAPIKey } from "../auth.js";

export async function handleWebhook(req: Request, res: Response) {
  const apiKey = getAPIKey(req);

  if (apiKey !== config.api.polkaKey) {
    return res.status(401).send();
  }

  type dataShape = {
    event: string;
    data: {
      userId: string;
    }
  }

  const { event, data } = req.body;

  console.log("event", event);

  if (event !== "user.upgraded") {
    return res.status(204).send();
  } else {
    console.log("user updated", data.userId);
    const user = await upgradeUserToChirpyRed(data.userId);

    if (!user) {
      return res.status(404).send();
    }

    return res.status(204).send();
  }
}