import { NextFunction, Request, Response } from "express";
import * as zod from "zod";

export const validateRequest = (zodSchema: zod.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
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
