import { PrismaPg } from "@prisma/adapter-pg";

import { envVariables } from "../config/env";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: envVariables.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export { prisma };
