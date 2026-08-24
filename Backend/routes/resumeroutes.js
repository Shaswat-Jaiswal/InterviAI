import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  uploadResume,
  saveResume,
  getResumes,
  reanalyzeResume,
  getMonthlyResumeCount,
} from "../auth/resumeController.js";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  uploadResume,
  saveResume,
);

router.post(
  "/:id/reanalyze",
  authMiddleware,
  reanalyzeResume
);


router.get("/monthly-count", authMiddleware, getMonthlyResumeCount);
router.get("/", authMiddleware, getResumes);

export default router;
