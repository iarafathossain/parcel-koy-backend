import { PrismaPg } from "@prisma/adapter-pg";

import { envVariables } from "../config/env.js";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: envVariables.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export { prisma };
