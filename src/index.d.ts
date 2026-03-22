import { IRequestUser } from "./interfaces/auth-type";

declare global {
  namespace Express {
    export interface Request {
      user?: IRequestUser;
    }
  }
}
