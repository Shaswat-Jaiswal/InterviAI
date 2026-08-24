import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authroutes.js";
import path from "path";
import { fileURLToPath } from "url";
import resumeRoutes from "./routes/resumeroutes.js";

dotenv.config();

console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "⚠️ Not set");
console.log("MONGO_URI:", process.env.MONGO_URI);

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:5174",
  "http://localhost:5173",
];

const allowedOrigins = [
  ...defaultOrigins,
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.status(200).send("Server is live and running! 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);

const server = http.createServer(app);

const PORT = process.env.PORT || 5001;


const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err);
    process.exit(1);
  }
};

startServer();