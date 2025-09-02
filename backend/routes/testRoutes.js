import { Router } from "express";
const router = Router();
import { createTest, getTests, getTestById, getTestByCode } from "../controllers/testController.js";
import auth from "../middleware/authMiddleware.js";

router.post("/", auth, createTest);
router.get("/", auth, getTests);
router.get("/:id", auth, getTestById);
router.get("/code/:code", getTestByCode);

export default router;