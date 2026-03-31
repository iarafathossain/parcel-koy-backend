import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { v7 as uuidv7 } from "uuid";
import { envVariables } from "../config/env";
import { Role, UserStatus } from "../generated/prisma/enums";
import { sendEmail } from "../utils/email";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: envVariables.BETTER_AUTH_URL,
  secret: envVariables.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.MERCHANT,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
      contactNumber: {
        type: "string",
        required: true,
      },
      gender: {
        type: "string",
        required: false,
      },
    },
  },
  emailVerification: {
    sendOnSignIn: true,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  redirectURLs: {
    signIn: `${envVariables.BETTER_AUTH_URL}/api/v1/auth/google/success`,
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        // Skip email sending during seeding
        if (process.env.SKIP_EMAIL_VERIFICATION === "true") {
          return;
        }

        // send email verification OTP
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });
          if (user && !user.emailVerified) {
            await sendEmail({
              to: email,
              subject: "Email Verification OTP",
              templateName: "otp",
              templateData: {
                otp,
                name: user.name,
              },
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });
          if (user) {
            await sendEmail({
              to: email,
              subject: "Password Reset OTP",
              templateName: "otp",
              templateData: {
                otp,
                name: user.name,
              },
            });
          }
        }
      },
      expiresIn: 2 * 60, // 2 minutes
      otpLength: 6,
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 60 * 24, // 1 day in second
    updateAge: 60 * 60 * 60 * 24, // 1 day in second
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24, // 1 day in second
    },
  },
  advanced: {
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          path: "/",
        },
      },
      sessionToken: {
        attributes: {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          path: "/",
        },
      },
    },
    database: {
      generateId: () => uuidv7(), // Use UUIDv7 for session,user,account IDs
    },
  },
});
