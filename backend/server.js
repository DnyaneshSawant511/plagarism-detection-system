import express, { json } from "express";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";

config();
connectDB();

const app = express();
app.use(cors());
app.use(json());
app.use(morgan("dev")); 

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/submissions", submissionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));