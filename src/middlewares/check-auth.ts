import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { envVariables } from "../config/env";
import AppError from "../errors/app-error";
import { Role } from "../generated/prisma/enums";
import { prisma } from "../libs/prisma";
import { cookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";

export const checkAuth =
  (...authRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // session token verification
      const sessionToken = cookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );

      if (!sessionToken) {
        return next(
          new AppError(
            status.UNAUTHORIZED,
            "Unauthorized Access! No session token provided",
          ),
        );
      }

      const sessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!sessionExists || !sessionExists.user) {
        return next(
          new AppError(
            status.UNAUTHORIZED,
            "Unauthorized Access! Invalid session token",
          ),
        );
      }

      if (sessionExists && sessionExists.user) {
        const user = sessionExists.user;
        const now = new Date();
        const expiresAt = new Date(sessionExists.expiresAt);
        const createdAt = new Date(sessionExists.createdAt);

        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentageTimeRemaining = (timeRemaining / sessionLifeTime) * 100;

        // Check if the session is about to expire in the next 20 minutes
        if (percentageTimeRemaining < 20) {
          res.setHeader("X-Session-refresh", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader(
            "X-Time-Remaining",
            `${Math.round(percentageTimeRemaining)}%`,
          );

          console.log(
            "session is about to expire, refreshing session token...",
          );
        }

        if (user.status === "BLOCKED" || user.status === "DELETED") {
          return next(
            new AppError(
              status.UNAUTHORIZED,
              "Unauthorized Access! User is not active",
            ),
          );
        }

        if (user.isDeleted) {
          return next(
            new AppError(
              status.UNAUTHORIZED,
              "Unauthorized Access! User is deleted",
            ),
          );
        }

        if (authRoles.length > 0 && !authRoles.includes(user.role)) {
          return next(
            new AppError(
              status.FORBIDDEN,
              "Forbidden Access! You don't have permission to access this resource",
            ),
          );
        }

        // attach user to request object
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          status: user.status,
          isDeleted: user.isDeleted,
          emailVerified: user.emailVerified,
        };
      }

      // access token verification

      const accessToken = cookieUtils.getCookie(req, "access_token");

      if (!accessToken) {
        return next(
          new AppError(
            status.UNAUTHORIZED,
            "Unauthorized Access! No access token provided",
          ),
        );
      }

      // verify access token
      const { success, data } = jwtUtils.verifyToken(
        accessToken,
        envVariables.ACCESS_TOKEN_SECRET,
      );

      if (!success || !data) {
        return next(
          new AppError(
            status.UNAUTHORIZED,
            "Unauthorized Access! Invalid access token",
          ),
        );
      }

      if (authRoles.length > 0 && !authRoles.includes(data.role)) {
        return next(
          new AppError(
            status.FORBIDDEN,
            "Forbidden Access! You don't have permission to access this resource",
          ),
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
