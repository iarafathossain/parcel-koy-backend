import { Server } from "http";
import app from "./app.js";
import { envVariables } from "./config/env.js";
import { prisma } from "./libs/prisma.js";
import { seedSuperAdmin } from "./utils/seed.js";

let server: Server;

const main = async () => {
  try {
    await prisma.$connect();
    console.log("✅Database connected successfully.");
    await seedSuperAdmin();
    console.log("✅Super Admin seeded successfully.");
    server = app.listen(envVariables.PORT, () => {
      console.log(`Server is running on port ${envVariables.PORT}`);
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error("❌Failed to connect to the database:", error);
    process.exit(1);
  }
};

// SIGTERM Signal Handler for graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  if (server) {
    server.close(() => {
      console.log("✅HTTP server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// SIGINT Signal Handler for graceful shutdown
process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  if (server) {
    server.close(() => {
      console.log("✅HTTP server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// UNCAUGHT EXCEPTION Handler for graceful shutdown
process.on("uncaughtException", (err) => {
  console.error("❌Uncaught Exception:", err);
  if (server) {
    server.close(() => {
      console.log("✅HTTP server closed due to uncaught exception");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// process.exit(0); // For testing graceful shutdown with SIGINT or SIGTERM
// process.exit(1); // For testing graceful shutdown with uncaughtException

main();
