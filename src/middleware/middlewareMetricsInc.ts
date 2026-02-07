import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export const middlewareMetricsInc = async (req: Request, res: Response, next: NextFunction) => {
  config.fileserverHits += 1;
  next();
}