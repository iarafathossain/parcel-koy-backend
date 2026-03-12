import express from "express";
import { indexRoutes } from "./routes/index";

const app = express();

// Enable urlencoded body parsing
app.use(express.urlencoded({ extended: true }));

// Enable JSON body parsing
app.use(express.json());

// Use the index routes
app.use("/api/v1", indexRoutes);

// test route
app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

export default app;
