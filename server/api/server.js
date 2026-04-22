import express from "express";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import errorHandler from "../middleware/errorMiddleware.js";
import cors from "cors";
import osintRoutes from "../routes/osint.routes.js";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:3000",
  "https://osint-client-ten.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.get("/api/test", (req, res) => res.json({ message: "Successful!" }));

// Routes
app.use("/api/v1/osint", osintRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
