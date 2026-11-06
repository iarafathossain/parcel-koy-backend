import { envVariables } from "../config/env.js";
import { Role } from "../generated/prisma/enums.js";
import { auth } from "../libs/auth.js";
import { prisma } from "../libs/prisma.js";

export const seedSuperAdmin = async () => {
  try {
    // Skip email sending during seeding
    process.env.SKIP_EMAIL_VERIFICATION = "true";

    const isSuperAdminExist = await prisma.user.findFirst({
      where: {
        role: Role.SUPER_ADMIN,
      },
    });

    if (isSuperAdminExist) {
      console.log("Super admin already exists. Skipping seeding super admin.");
      return;
    }

    const superAdminUser = await auth.api.signUpEmail({
      body: {
        email: envVariables.SUPER_ADMIN_EMAIL,
        password: envVariables.SUPER_ADMIN_PASSWORD,
        name: envVariables.SUPER_ADMIN_NAME,
        role: Role.SUPER_ADMIN,
        needPasswordChange: false,
        rememberMe: false,
        contactNumber: envVariables.SUPER_ADMIN_PHONE,
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: superAdminUser.user.id,
        },
        data: {
          emailVerified: true,
        },
      });

      await tx.admin.create({
        data: {
          userId: superAdminUser.user.id,
        },
      });
    });

    const superAdmin = await prisma.admin.findFirst({
      where: {
        user: {
          email: envVariables.SUPER_ADMIN_EMAIL,
        },
      },
      include: {
        user: true,
      },
    });

    console.log("Super Admin Created ", superAdmin);
  } catch (error) {
    console.error("Error seeding super admin: ", error);
    await prisma.user.delete({
      where: {
        email: envVariables.SUPER_ADMIN_EMAIL,
      },
    });
  } finally {
    // Re-enable email sending
    delete process.env.SKIP_EMAIL_VERIFICATION;
  }
};
