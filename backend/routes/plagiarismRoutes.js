import express from "express";
import { generatePlagiarismGraph } from "../controllers/plagiarismController.js";

const router = express.Router();

router.get("/:testId/graph", generatePlagiarismGraph);

export default router;