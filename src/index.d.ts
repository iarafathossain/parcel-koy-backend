import { IRequestUser } from "./interfaces/auth-type.js";

declare global {
  namespace Express {
    export interface Request {
      user?: IRequestUser;
    }
  }
}
