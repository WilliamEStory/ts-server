import { NextFunction, Request, Response } from "express";

import { respondWithError } from "../api/json.js";

export const middlewareError = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    respondWithError(res, 500, "Something went wrong on our end");
}