import { Role, UserStatus } from "../generated/prisma/enums";

export interface IJwtPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
  image: string | null;
  status: UserStatus;
  isDeleted: boolean;
  emailVerified: boolean;
  iat?: number;
  exp?: number;
}

export interface IRequestUser {
  userId: string;
  email: string;
  role: Role;
  name: string;
  status: UserStatus;
  isDeleted: boolean;
  emailVerified: boolean;
}
