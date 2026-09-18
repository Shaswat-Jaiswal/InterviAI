import fs from "fs";
import path from "path";
import multer from "multer";
import { Resume } from "../Models/Resume.js";
import {
  extractPdfText,
  calculateAtsScore,
  calculateAtsAnalysis,
} from "./atsAnalyzer.js";

const uploadDirectory = path.join(process.cwd(), "uploads", "resumes");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (req, file, callback) => {
    const safeFileName = `${Date.now()}-${file.originalname.replace(
      /[^a-zA-Z0-9.-]/g,
      "_"
    )}`;

    callback(null, safeFileName);
  },
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype === "application/pdf") {
    callback(null, true);
  } else {
    callback(new Error("Sirf PDF resume upload kar sakte hain."));
  }
};

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("resume");

// const formatResumeItem = (item) => {
//   if (typeof item === "string") {
//     return item;
//   }

//   if (item && typeof item === "object") {
//     return [
//       item.title,
//       item.role,
//       item.company,
//       item.name,
//       item.description,
//       item.details,
//       item.text,
//       item.techStack,
//       item.technologies,
//       item.stack,
//       item.date,
//       item.location,
//       item.link,
//     ]
//       .filter(Boolean)
//       .join(" - ");
//   }

//   return String(item ?? "");
// };

// const normalizeArray = (value) => {
//   if (!value) return [];
//   return Array.isArray(value) ? value : [value];
// };

// const flattenSkills = (skills) => {
//   if (!skills) return [];

//   if (Array.isArray(skills)) {
//     return skills;
//   }

//   if (typeof skills === "object") {
//     return Object.values(skills).flatMap((category) =>
//       Array.isArray(category) ? category : normalizeArray(category)
//     );
//   }

//   return [skills];
// };


export const saveResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file required hai.",
      });
    }

    const fileBuffer = await fs.promises.readFile(req.file.path);
    const extractedText = await extractPdfText(fileBuffer);
    const analysis = calculateAtsAnalysis(extractedText);
    const atsScore = calculateAtsScore(extractedText);

    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      filePath: `/uploads/resumes/${req.file.filename}`,
      atsScore,
      atsBreakdown: analysis.breakdown,
      analysisStatus: "completed",
    });

    return res.status(201).json({
      success: true,
      message: "Resume upload aur ATS analysis successfully complete ho gaya.",
      resume,
    });
  } catch (error) {
    console.error("ATS analysis error:", error);

    return res.status(500).json({
      success: false,
      message: "Resume upload ho gaya, lekin ATS analysis nahi ho saka.",
      error: error.message,
    });
  }
};

export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({
      userId: req.user._id,
    })
      .sort({ uploadedAt: -1 })
      .limit(4);

    return res.status(200).json({
      success: true,
      resumes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const reanalyzeResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume nahi mila.",
      });
    }

    const absolutePath = path.join(
      process.cwd(),
      resume.filePath.replace(/^\/+/, "")
    );

    const fileBuffer = await fs.promises.readFile(absolutePath);
    const extractedText = await extractPdfText(fileBuffer);
    const analysis = calculateAtsAnalysis(extractedText);

    resume.atsScore = analysis.total;
    resume.atsBreakdown = analysis.breakdown;
    resume.analysisStatus = "completed";

    await resume.save();

    res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Resume re-analyze nahi ho saka.",
    });
  }
};

export const getMonthlyResumeCount = async (req, res) => {
  try{
    const now = new Date();
    const startOfMonth =   new Date(now.getFullYear(), now.getMonth(), 1);
     const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

 
     const count = await Resume.countDocuments({
       userId: req.user._id,
      analysisStatus: "completed",
      uploadedAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
     });

     
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });

  }
}