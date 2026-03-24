import { Gender } from "../generated/prisma/enums";

export interface IResponseData<T> {
  httpStatusCode: number;
  success: boolean;
  message: string;
  requiredEmailVerification?: boolean;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IEnvConfig {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  PORT: string;
  NODE_ENV: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  ACCESS_TOKEN_COOKIE_MAX_AGE: string;
  REFRESH_TOKEN_COOKIE_MAX_AGE: string;
  BETTER_AUTH_SESSION_COOKIE_MAX_AGE: string;
  EMAIL_SENDER: {
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_FROM: string;
  };
  FRONTEND_URL: string;
  CLOUDINARY: {
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  };
  STRIPE: {
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
  };
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
  SUPER_ADMIN_GENDER: Gender;
  SUPER_ADMIN_NAME: string;
  SUPER_ADMIN_PHONE: string;

  DELIVERY_MASTER_OTP: string;
  OTP_EXPIRATION_MINUTES: string;
}

export interface IErrorSource {
  path: string;
  message: string;
}

export interface IErrorResponse {
  success: boolean;
  message: string;
  errorSources: IErrorSource[];
  statusCode: number;
  stack?: string;
  error?: unknown;
}
