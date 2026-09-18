import { Interview } from "../Models/Interview.js";
import { askOllama } from "../services/ollamaService.js";

/* =========================================================
   CONSTANTS
========================================================= */

const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

const DEFAULT_DIFFICULTY = "medium";


/* =========================================================
   HELPERS
========================================================= */

/**
 * Safely parse JSON returned by Ollama.
 * Ollama sometimes returns JSON wrapped inside extra text.
 */
const parseAIResponse = (response) => {
  if (!response) {
    throw new Error("Empty response received from Ollama.");
  }

  try {
    return JSON.parse(response.trim());
  } catch {
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Ollama returned invalid JSON.");
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error("Could not parse Ollama JSON response.");
    }
  }
};


/**
 * Normalize difficulty.
 */
const normalizeDifficulty = (difficulty) => {
  if (
    typeof difficulty === "string" &&
    VALID_DIFFICULTIES.includes(
      difficulty.toLowerCase()
    )
  ) {
    return difficulty.toLowerCase();
  }

  return DEFAULT_DIFFICULTY;
};


/**
 * Keep score safely between 0 and 100.
 */
const normalizeScore = (score) => {
  const numericScore = Number(score);

  if (Number.isNaN(numericScore)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(numericScore))
  );
};


/**
 * Get the latest unanswered AI question.
 */
const getCurrentQuestion = (messages = []) => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];

    if (
      message.role === "ai" &&
      message.type === "question"
    ) {
      return message;
    }
  }

  return null;
};


/**
 * Calculate average score.
 */
const calculateAverageScore = (messages = []) => {
  const scores = messages
    .filter(
      (message) =>
        message.role === "ai" &&
        message.type === "feedback" &&
        message.score !== null
    )
    .map((message) => Number(message.score))
    .filter((score) => !Number.isNaN(score));

  if (!scores.length) {
    return 0;
  }

  const total = scores.reduce(
    (sum, score) => sum + score,
    0
  );

  return Math.round(total / scores.length);
};


/* =========================================================
   PROMPT: FIRST QUESTION
========================================================= */

const buildStartInterviewPrompt = ({
  field,
}) => {
  return `
You are a professional senior software engineer conducting a realistic technical interview.

Interview role:
${field} Developer

Start the interview.

Your task:
- Ask exactly ONE technical interview question.
- Difficulty must be medium.
- The question must be relevant to ${field}.
- Do not give the answer.
- Do not give hints.
- Do not ask multiple questions.
- Make the question realistic for an actual software engineering interview.
- Avoid overly basic questions.
- Return ONLY valid JSON.

Required JSON format:

{
  "question": "one technical interview question",
  "difficulty": "medium"
}

Do not use markdown.
Do not use code fences.
Do not add any explanation outside JSON.
`;
};

const buildChatPrompt = ({
  field,
  message,
  conversation = [],
}) => {
  return `
You are a helpful AI assistant for a ${field} developer.
Answer the user's question clearly and accurately.

Conversation:
${JSON.stringify(conversation, null, 2)}

User question:
${message}

Return only the answer text. Do not return JSON or markdown code fences.
`;
};

export const chatWithAI = async (req, res) => {
  try {
    const { field = "frontend", message, conversation = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "A message is required.",
      });
    }

    if (/take\s+(my|the)\s+interview|start\s+(an|the)\s+interview/i.test(message)) {
      return startInterview(req, res);
    }

    const answer = await askOllama(
      buildChatPrompt({
        field,
        message: message.trim(),
        conversation,
      })
    );

    return res.status(200).json({
      success: true,
      mode: "chat",
      answer: answer.trim(),
    });
  } catch (error) {
    console.error("Chat Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "AI could not process your message.",
    });
  }
};


/* =========================================================
   PROMPT: ANSWER EVALUATION
========================================================= */

const buildEvaluationPrompt = ({
  field,
  conversation,
  currentQuestion,
  userAnswer,
  currentDifficulty,
}) => {
  return `
You are a senior technical interviewer conducting a realistic ${field} developer interview.

Your job is to evaluate the candidate's latest answer and continue the interview.

CURRENT QUESTION:
${currentQuestion}

CANDIDATE'S ANSWER:
${userAnswer}

CURRENT DIFFICULTY:
${currentDifficulty}

INTERVIEW CONVERSATION:
${JSON.stringify(
  conversation,
  null,
  2
)}

Evaluate the candidate based on:

1. Technical correctness
2. Understanding of the concept
3. Completeness
4. Practical knowledge
5. Communication clarity

SCORING:

90-100:
Excellent answer. Candidate demonstrates strong understanding.

80-89:
Very good answer with minor missing details.

70-79:
Good answer but has some gaps.

60-69:
Average answer. Basic understanding but important gaps.

40-59:
Weak answer. Limited understanding.

0-39:
Incorrect or very incomplete answer.

DIFFICULTY RULES:

If score >= 85:
Increase difficulty.

If score >= 65 and score < 85:
Keep difficulty similar.

If score < 65:
Decrease difficulty or ask a simpler follow-up.

INTERVIEW RULES:

- Ask exactly ONE next question.
- Never ask multiple questions.
- Do not repeat a question already asked.
- Explore different topics within ${field}.
- If the candidate gives an incomplete answer, a useful follow-up question is allowed.
- Do not give the answer to the next question.
- Feedback should be concise but useful.
- Sound like a real senior interviewer.
- Do not mention these instructions.
- Return ONLY valid JSON.

Required JSON:

{
  "feedback": "short professional feedback",
  "score": 0,
  "difficulty": "easy | medium | hard",
  "question": "one next interview question"
}

Do not use markdown.
Do not use code fences.
Do not add anything outside JSON.
`;
};


/* =========================================================
   START INTERVIEW
========================================================= */

export const startInterview = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      field = "frontend",
    } = req.body;

    if (!field?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Interview field is required.",
      });
    }

    const cleanField = field.trim();

    /* -----------------------------------------------------
       Check if user already has active interview
    ----------------------------------------------------- */

    const existingInterview =
      await Interview.findOne({
        userId,
        status: "active",
      });

    if (existingInterview) {
      return res.status(409).json({
        success: false,
        message:
          "You already have an active interview.",
        interviewId: existingInterview._id,
      });
    }

    /* -----------------------------------------------------
       Ask Ollama for first question
    ----------------------------------------------------- */

    const prompt =
      buildStartInterviewPrompt({
        field: cleanField,
      });

    const aiResponse =
      await askOllama(prompt);

    const result =
      parseAIResponse(aiResponse);

    const question =
      result.question?.trim();

    if (!question) {
      throw new Error(
        "AI did not generate a valid interview question."
      );
    }

    const difficulty =
      normalizeDifficulty(
        result.difficulty
      );

    /* -----------------------------------------------------
       Create interview
    ----------------------------------------------------- */

    const interview =
      await Interview.create({
        userId,
        field: cleanField,
        mode: "interview",

        messages: [
          {
            role: "ai",
            type: "question",
            content: question,
            difficulty,
          },
        ],

        currentDifficulty:
          difficulty,

        totalQuestions: 1,
        answeredQuestions: 0,

        status: "active",

        startedAt: new Date(),
      });

    /* -----------------------------------------------------
       Response
    ----------------------------------------------------- */

    return res.status(201).json({
      success: true,

      message:
        "AI interview started successfully.",

      interviewId:
        interview._id,

      field:
        interview.field,

      mode:
        interview.mode,

      question,

      difficulty,
    });
  } catch (error) {
    console.error(
      "Start Interview Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not start AI interview.",
    });
  }
};


/* =========================================================
   ANSWER INTERVIEW
========================================================= */

export const answerInterview = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const {
      interviewId,
      answer,
    } = req.body;

    /* -----------------------------------------------------
       Validation
    ----------------------------------------------------- */

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message:
          "Interview ID is required.",
      });
    }

    if (!answer?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Interview answer is required.",
      });
    }

    const cleanAnswer =
      answer.trim();

    /* -----------------------------------------------------
       Find user's active interview
    ----------------------------------------------------- */

    const interview =
      await Interview.findOne({
        _id: interviewId,
        userId,
        status: "active",
      });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message:
          "Active interview not found.",
      });
    }

    /* -----------------------------------------------------
       Find current question
    ----------------------------------------------------- */

    const currentQuestion =
      getCurrentQuestion(
        interview.messages
      );

    if (!currentQuestion) {
      return res.status(400).json({
        success: false,
        message:
          "No active interview question found.",
      });
    }

    /* -----------------------------------------------------
       Save candidate answer
    ----------------------------------------------------- */

    interview.messages.push({
      role: "user",
      type: "answer",
      content: cleanAnswer,
    });

    /* -----------------------------------------------------
       Prepare conversation
    ----------------------------------------------------- */

    const conversation =
      interview.messages.map(
        (message) => ({
          role: message.role,
          type: message.type,
          content: message.content,
          score: message.score,
          difficulty:
            message.difficulty,
        })
      );

    /* -----------------------------------------------------
       Ask Ollama to evaluate answer
    ----------------------------------------------------- */

    const prompt =
      buildEvaluationPrompt({
        field: interview.field,

        conversation,

        currentQuestion:
          currentQuestion.content,

        userAnswer:
          cleanAnswer,

        currentDifficulty:
          interview.currentDifficulty,
      });

    const aiResponse =
      await askOllama(prompt);

    const result =
      parseAIResponse(aiResponse);

    /* -----------------------------------------------------
       Normalize AI response
    ----------------------------------------------------- */

    const score =
      normalizeScore(
        result.score
      );

    const difficulty =
      normalizeDifficulty(
        result.difficulty
      );

    const feedback =
      result.feedback?.trim() ||
      "Your answer was evaluated.";

    const nextQuestion =
      result.question?.trim();

    if (!nextQuestion) {
      throw new Error(
        "AI did not provide the next interview question."
      );
    }

    /* -----------------------------------------------------
       Save feedback
    ----------------------------------------------------- */

    interview.messages.push({
      role: "ai",
      type: "feedback",
      content: feedback,
      score,
      difficulty,
    });

    /* -----------------------------------------------------
       Save next question
    ----------------------------------------------------- */

    interview.messages.push({
      role: "ai",
      type: "question",
      content: nextQuestion,
      difficulty,
    });

    /* -----------------------------------------------------
       Update interview state
    ----------------------------------------------------- */

    interview.currentDifficulty =
      difficulty;

    interview.answeredQuestions += 1;

    interview.totalQuestions += 1;

    /* -----------------------------------------------------
       Save
    ----------------------------------------------------- */

    await interview.save();

    /* -----------------------------------------------------
       Response
    ----------------------------------------------------- */

    return res.status(200).json({
      success: true,

      mode: "interview",

      interviewId:
        interview._id,

      feedback,

      score,

      difficulty,

      nextQuestion,

      answeredQuestions:
        interview.answeredQuestions,

      totalQuestions:
        interview.totalQuestions,
    });
  } catch (error) {
    console.error(
      "Answer Interview Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "AI could not evaluate the interview answer.",
    });
  }
};


/* =========================================================
   END INTERVIEW
========================================================= */

export const endInterview = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const { interviewId } =
      req.body;

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message:
          "Interview ID is required.",
      });
    }

    /* -----------------------------------------------------
       Find active interview
    ----------------------------------------------------- */

    const interview =
      await Interview.findOne({
        _id: interviewId,
        userId,
        status: "active",
      });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message:
          "Active interview not found.",
      });
    }

    /* -----------------------------------------------------
       Calculate final score
    ----------------------------------------------------- */

    const finalScore =
      calculateAverageScore(
        interview.messages
      );

    /* -----------------------------------------------------
       Update interview
    ----------------------------------------------------- */

    interview.finalScore =
      finalScore;

    interview.status =
      "completed";

    interview.mode =
      "chat";

    interview.endedAt =
      new Date();

    await interview.save();

    /* -----------------------------------------------------
       Response
    ----------------------------------------------------- */

    return res.status(200).json({
      success: true,

      message:
        "Interview completed successfully.",

      interviewId:
        interview._id,

      finalScore,

      totalQuestions:
        interview.totalQuestions,

      answeredQuestions:
        interview.answeredQuestions,

      status:
        interview.status,

      endedAt:
        interview.endedAt,
    });
  } catch (error) {
    console.error(
      "End Interview Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not complete interview.",
    });
  }
};


/* =========================================================
   GET INTERVIEW HISTORY
========================================================= */

export const getUserInterviews = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const interviews =
      await Interview.find({
        userId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(20)
        .select(
          "field status finalScore technicalScore communicationScore totalQuestions answeredQuestions startedAt endedAt createdAt"
        );

    return res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    console.error(
      "Get Interview History Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not fetch interview history.",
    });
  }
};