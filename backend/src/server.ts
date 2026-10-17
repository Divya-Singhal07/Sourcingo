import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createChatRouter } from './routes/chat.routes.js';

import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";
import marketplaceRoutes from "./routes/marketplace.routes";
import loyaltyRoutes from "./routes/loyalty.routes";
import recommendationRoutes from "./routes/recommendationRoutes.js";

const app: Application = express();

const port = Number(process.env.PORT ?? 5000);
const frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl) {
  throw new Error("Missing FRONTEND_URL in .env");
}


app.use(helmet());

app.use(cors({
  origin: frontendUrl,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "1mb" }));
app.use('/api/chat', createChatRouter());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "sourcingo-backend",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api", recommendationRoutes); // This will make your route available at POST /api/recommend

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((
  err: Error,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  console.error(err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Sourcingo backend running on http://localhost:${port}`);
});