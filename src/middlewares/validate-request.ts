import { NextFunction, Request, Response } from "express";
import * as zod from "zod";

export const validateRequest = (zodSchema: zod.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const incomingBody = req.body ?? {};

    if (
      typeof incomingBody === "object" &&
      incomingBody !== null &&
      "data" in incomingBody &&
      typeof incomingBody.data === "string"
    ) {
      req.body = JSON.parse(incomingBody.data);
    } else {
      req.body = incomingBody;
    }

    const validationResult = zodSchema.safeParse(req.body);

    if (!validationResult.success) {
      return next(validationResult.error);
    }

    // sanitize the request body to only include the validated data
    req.body = validationResult.data;

    return next();
  };
};
