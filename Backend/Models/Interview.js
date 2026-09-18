import mongoose from "mongoose";

const interviewMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["ai", "user"],
      required: true,
    },

    type: {
      type: String,
      enum: [
        "question",
        "answer",
        "feedback",
        "system",
      ],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  {
    _id: false,
  }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    field: {
      type: String,
      required: true,
      trim: true,
    },

    mode: {
      type: String,
      enum: ["chat", "interview"],
      default: "chat",
    },

    messages: {
      type: [interviewMessageSchema],
      default: [],
    },

    currentDifficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    answeredQuestions: {
      type: Number,
      default: 0,
    },

    finalScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    technicalScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    communicationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Interview = mongoose.model(
  "Interview",
  interviewSchema
);