import status from "http-status";
import * as zod from "zod";
import { IErrorResponse, IErrorSource } from "../interfaces/util-type.js";

export const handleZodError = (error: zod.ZodError): IErrorResponse => {
  const statusCode = status.BAD_REQUEST;
  const message = "Validation error";
  const errorSources: IErrorSource[] = [];

  error.issues.forEach((issue) => {
    errorSources.push({
      message: issue.message,
      path: issue.path.join(" => "),
    });
  });

  return {
    success: false,
    message,
    errorSources,
    statusCode,
  };
};
