import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        filePath: {
            type: String,
            required: true,
        },
      atsScore: {
      type: Number,
      default: 0,
    },
    analysisStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    atsBreakdown: {
  content: {
    type: Number,
    default: 0,
  },
  skills: {
    type: Number,
    default: 0,
  },
  experience: {
    type: Number,
    default: 0,
  },
  projects: {
    type: Number,
    default: 0,
  },
  formatting: {
    type: Number,
    default: 0,
  },
},
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true}
);
export const Resume = mongoose.model("Resume", resumeSchema);