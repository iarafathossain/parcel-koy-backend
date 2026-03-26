import "dotenv/config";
import { Gender } from "../generated/prisma/enums";
import { IEnvConfig } from "../interfaces/util-type";

const loadEnvironmentVariables = (): IEnvConfig => {
  // required environment variables
  const requiredEnvVars = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "PORT",
    "NODE_ENV",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
    "ACCESS_TOKEN_COOKIE_MAX_AGE",
    "REFRESH_TOKEN_COOKIE_MAX_AGE",
    "BETTER_AUTH_SESSION_COOKIE_MAX_AGE",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_PASS",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_FROM",
    "FRONTEND_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "STRIPE_SECRET_key",
    "STRIPE_WEBHOOK_SECRET",
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",
    "SUPER_ADMIN_GENDER",
    "SUPER_ADMIN_NAME",
    "SUPER_ADMIN_PHONE",
    "DELIVERY_MASTER_OTP",
    "OTP_EXPIRATION_MINUTES",
    "CLEAR_DUE_PAYMENT_SUCCESS_URL",
    "CLEAR_DUE_PAYMENT_CANCEL_URL",
  ];

  requiredEnvVars.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(
        `Environment variable ${variable} is required but not defined.`,
      );
    }
  });

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
    PORT: process.env.PORT!,
    NODE_ENV: process.env.NODE_ENV!,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN!,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN!,
    ACCESS_TOKEN_COOKIE_MAX_AGE: process.env.ACCESS_TOKEN_COOKIE_MAX_AGE!,
    REFRESH_TOKEN_COOKIE_MAX_AGE: process.env.REFRESH_TOKEN_COOKIE_MAX_AGE!,
    BETTER_AUTH_SESSION_COOKIE_MAX_AGE:
      process.env.BETTER_AUTH_SESSION_COOKIE_MAX_AGE!,
    EMAIL_SENDER: {
      SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST!,
      SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT!,
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER!,
      SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS!,
      SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM!,
    },
    FRONTEND_URL: process.env.FRONTEND_URL!,
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
    },
    STRIPE: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_key!,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
    },
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL!,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD!,
    SUPER_ADMIN_GENDER: process.env.SUPER_ADMIN_GENDER! as Gender,
    SUPER_ADMIN_NAME: process.env.SUPER_ADMIN_NAME!,
    SUPER_ADMIN_PHONE: process.env.SUPER_ADMIN_PHONE!,
    DELIVERY_MASTER_OTP: process.env.DELIVERY_MASTER_OTP!,
    OTP_EXPIRATION_MINUTES: process.env.OTP_EXPIRATION_MINUTES!,
    CLEAR_DUE_PAYMENT_SUCCESS_URL: process.env.CLEAR_DUE_PAYMENT_SUCCESS_URL!,
    CLEAR_DUE_PAYMENT_CANCEL_URL: process.env.CLEAR_DUE_PAYMENT_CANCEL_URL!,
  };
};

export const envVariables = loadEnvironmentVariables();
