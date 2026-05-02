import http from "http";
import https from "https";
import cron from "node-cron";
import { envVariables } from "../config/env";

export const keepServerAlive = () => {
  cron.schedule("*/1 * * * *", () => {
    console.log("Pinging server to keep it awake...");

    try {
      const target = envVariables.BETTER_AUTH_URL;
      if (!target) {
        console.error("No BETTER_AUTH_URL configured. Skipping ping.");
        return;
      }

      let client: typeof http | typeof https;
      try {
        const parsed = new URL(target);
        if (parsed.protocol === "https:") client = https;
        else if (parsed.protocol === "http:") client = http;
        else {
          console.error(`Ping failed: Unsupported protocol ${parsed.protocol}`);
          return;
        }
      } catch (err) {
        console.error("Ping failed: Invalid URL", err);
        return;
      }

      client
        .get(target, (res) => {
          if (res.statusCode === 200) {
            console.log("Ping successful!");
          } else {
            console.error(`Ping failed with status code: ${res.statusCode}`);
          }
        })
        .on("error", (err: Error) => {
          console.error("Error during ping:", err.message);
        });
    } catch (error) {
      console.error("Error during ping:", error);
    }
  });
};
