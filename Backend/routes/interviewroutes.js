import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";

import {
  chatWithAI,
  answerInterview,
  endInterview,
} from "../auth/interviewController.js";

const router = express.Router();

router.use(authMiddleware);

// Normal chat + interview detection
router.post("/chat", chatWithAI);
router.post("/answer", answerInterview);
router.post("/end", endInterview);

export default router;