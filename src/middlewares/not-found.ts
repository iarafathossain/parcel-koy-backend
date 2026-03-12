import { Request, Response } from "express";
import status from "http-status";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(status.NOT_FOUND).json({
    success: false,
    statusCode: status.NOT_FOUND,
    message: "The requested resource was not found.",
    errorSources: [
      {
        message: "No route matched the requested URL.",
        path: `${req.method} ${req.originalUrl}`,
      },
    ],
  });
};
