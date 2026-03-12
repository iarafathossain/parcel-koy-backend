import { Server } from "http";
import app from "./app";
import { envVariables } from "./config/env";
import { prisma } from "./libs/prisma";

let server: Server;

const main = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully.");
    server = app.listen(envVariables.PORT, () => {
      console.log(`Server is running on port ${envVariables.PORT}`);
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

// SIGTERM Signal Handler for graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
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
      console.log("HTTP server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// UNCAUGHT EXCEPTION Handler for graceful shutdown
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  if (server) {
    server.close(() => {
      console.log("HTTP server closed due to uncaught exception");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// process.exit(0); // For testing graceful shutdown with SIGINT or SIGTERM
// process.exit(1); // For testing graceful shutdown with uncaughtException

main();
