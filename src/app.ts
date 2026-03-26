import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import express, { Application } from "express";
import path from "path";
import qs from "qs";
import { auth } from "./libs/auth";
import { globalErrorHandler } from "./middlewares/global-error-handler";
import { notFoundHandler } from "./middlewares/not-found";
import { payoutController } from "./modules/payout/controllers";
import { indexRoutes } from "./routes/index";

const app: Application = express();

app.set("query parser", (str: string) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/templates`));

// Enable urlencoded body parsing
app.use(express.urlencoded({ extended: true }));

// Stripe webhook route
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  payoutController.handleStripeWebhookEvent,
);

// Enable JSON body parsing
app.use(express.json());

// Parse Cookie header into req.cookies
app.use(cookieParser());

// better-auth routes
app.all("/api/auth/{*any}", toNodeHandler(auth));

// Use the index routes
app.use("/api/v1", indexRoutes);

// Root route renders an HTML file
app.get("/", (_req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

// Global error handler
app.use(globalErrorHandler);

// not found route handler
app.use(notFoundHandler);

export default app;
