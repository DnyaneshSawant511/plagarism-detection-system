import express from "express";
import { createSubmission, getSubmissionsByTest, getSubmissionById } from "../controllers/submissionController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createSubmission);
router.get("/:testId", auth, getSubmissionsByTest);
router.get("/detail/:id", auth, getSubmissionById);

export default router;