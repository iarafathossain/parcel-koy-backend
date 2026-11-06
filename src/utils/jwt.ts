import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { IJwtPayload } from "../interfaces/auth-type.js";

const createToken = (
  payload: JwtPayload,
  secrete: string,
  { expiresIn }: SignOptions,
) => {
  return jwt.sign(payload, secrete, { expiresIn });
};

const verifyToken = (
  token: string,
  secrete: string,
):
  | { success: true; data: IJwtPayload }
  | { success: false; error: string; data?: undefined } => {
  try {
    const decoded = jwt.verify(token, secrete) as IJwtPayload;
    return {
      success: true,
      data: decoded,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

const decodeToken = (token: string) => {
  return jwt.decode(token);
};

export const jwtUtils = {
  createToken,
  verifyToken,
  decodeToken,
};
