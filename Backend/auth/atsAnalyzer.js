import { PDFParse } from "pdf-parse";

export const extractPdfText = async (buffer) => {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text || "";
  } finally {
    await parser.destroy();
  }
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hasKeyword = (text, keywords) =>
  keywords.some((keyword) => {
    const pattern = new RegExp(
      `\\b${escapeRegex(keyword)}\\b`,
      "i"
    );

    return pattern.test(text);
  });

const countMatchedKeywords = (text, keywords) =>
  keywords.filter((keyword) => {
    const pattern = new RegExp(
      `\\b${escapeRegex(keyword)}\\b`,
      "i"
    );

    return pattern.test(text);
  }).length;

export const calculateAtsScore = (text) => {
  const resumeText = text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  const words = resumeText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let score = 0;

  // ==========================================
  // 1. CONTACT DETAILS - 8 POINTS
  // ==========================================

  const hasEmail =
    /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(
      resumeText
    );

  const hasPhone =
    /(?:\+?\d[\d\s().-]{9,}\d)/.test(resumeText);

  const hasLinkedIn =
    /\blinkedin\.com\/in\/[\w-]+/i.test(resumeText);

  const hasGithub =
    /\bgithub\.com\/[\w-]+/i.test(resumeText);

  if (hasEmail) score += 3;
  if (hasPhone) score += 3;
  if (hasLinkedIn) score += 1;
  if (hasGithub) score += 1;


  // ==========================================
  // 2. RESUME SECTIONS - 25 POINTS
  // ==========================================

  const sections = [
    {
      keywords: [
        "summary",
        "professional summary",
        "profile",
        "objective",
      ],
      points: 4,
    },

    {
      keywords: [
        "experience",
        "work experience",
        "work history",
        "employment history",
      ],
      points: 7,
    },

    {
      keywords: [
        "education",
        "academic background",
      ],
      points: 5,
    },

    {
      keywords: [
        "skills",
        "technical skills",
        "core competencies",
      ],
      points: 5,
    },

    {
      keywords: [
        "projects",
        "personal projects",
      ],
      points: 4,
    },
  ];

  for (const section of sections) {
    if (hasKeyword(resumeText, section.keywords)) {
      score += section.points;
    }
  }


  // ==========================================
  // 3. TECHNICAL SKILLS - 15 POINTS
  // ==========================================

  const technicalKeywords = [
    "javascript",
    "typescript",
    "react",
    "node",
    "node.js",
    "express",
    "express.js",
    "python",
    "java",
    "sql",
    "mongodb",
    "mysql",
    "postgresql",
    "aws",
    "azure",
    "docker",
    "git",
    "github",
    "rest",
    "api",
    "html",
    "css",
    "tailwind",
    "redux",
    "mongoose",
  ];

  const technicalSkillCount = countMatchedKeywords(
    resumeText,
    technicalKeywords
  );

  // First 4 skills = 1 point each
  // Additional skills = 0.75
  const technicalScore =
    Math.min(technicalSkillCount, 4) +
    Math.max(technicalSkillCount - 4, 0) * 0.75;

  score += Math.min(technicalScore, 15);


  // ==========================================
  // 4. ACTION VERBS - 7 POINTS
  // ==========================================

  const actionVerbs = [
    "developed",
    "implemented",
    "designed",
    "improved",
    "managed",
    "created",
    "optimized",
    "led",
    "built",
    "automated",
    "integrated",
    "deployed",
    "engineered",
    "configured",
  ];

  const actionVerbCount = countMatchedKeywords(
    resumeText,
    actionVerbs
  );

  score += Math.min(actionVerbCount * 0.75, 7);


  // ==========================================
  // 5. MEASURABLE ACHIEVEMENTS - 15 POINTS
  // ==========================================

  const measurableAchievements =
    resumeText.match(
      /\b\d+(?:\.\d+)?\s*(%|percent|users|clients|projects|years|months|hours|x)\b/gi
    ) || [];

  const uniqueAchievements = [
    ...new Set(measurableAchievements.map((item) => item.toLowerCase())),
  ];

  score += Math.min(uniqueAchievements.length * 2.5, 15);


  // ==========================================
  // 6. CONTENT QUALITY - 15 POINTS
  // ==========================================

  // Ideal resume length
  if (wordCount >= 350 && wordCount <= 750) {
    score += 8;
  } else if (wordCount >= 250 && wordCount <= 900) {
    score += 5;
  } else if (wordCount >= 150 && wordCount <= 1000) {
    score += 2;
  }

  // Achievement/result-oriented language
  const qualityKeywords = [
    "achievements",
    "results",
    "responsibilities",
    "impact",
    "performance",
    "increased",
    "reduced",
    "improved",
  ];

  const qualityCount = countMatchedKeywords(
    resumeText,
    qualityKeywords
  );

  score += Math.min(qualityCount * 0.75, 4);


  // ==========================================
  // 7. DATE / TIMELINE - 3 POINTS
  // ==========================================

  const years =
    resumeText.match(/\b(19|20)\d{2}\b/g) || [];

  const uniqueYears = [...new Set(years)];

  if (uniqueYears.length >= 2) {
    score += 3;
  } else if (uniqueYears.length === 1) {
    score += 1;
  }


  // ==========================================
  // 8. ATS FORMATTING - 10 POINTS
  // ==========================================

  let formattingScore = 10;

  // Too many special characters
  const specialCharacterCount =
    (resumeText.match(/[|{}<>[\]~`]/g) || []).length;

  if (specialCharacterCount > 10) {
    formattingScore -= 2;
  }

  // Too many repeated spaces
  if (/\s{3,}/.test(text)) {
    formattingScore -= 1;
  }

  // Extremely long lines
  const lines = text.split("\n");

  const longLines = lines.filter(
    (line) => line.trim().length > 180
  ).length;

  if (longLines > 3) {
    formattingScore -= 2;
  }

  // Resume should contain common ATS sections
  const atsSections = [
    "education",
    "skills",
    "experience",
    "projects",
  ];

  const atsSectionCount = countMatchedKeywords(
    resumeText,
    atsSections
  );

  if (atsSectionCount < 3) {
    formattingScore -= 3;
  }

  score += Math.max(formattingScore, 0);


  // ==========================================
  // 9. UNNECESSARY PERSONAL INFORMATION
  // ==========================================

  const unnecessaryDetails = [
    "photo",
    "date of birth",
    "dob",
    "marital status",
    "religion",
    "passport",
    "aadhar",
    "aadhaar",
    "hobbies",
    "father's name",
    "father name",
    "mother's name",
    "mother name",
  ];

  const unnecessaryDetailCount =
    countMatchedKeywords(
      resumeText,
      unnecessaryDetails
    );

  score -= Math.min(
    unnecessaryDetailCount * 2.5,
    10
  );


  // ==========================================
  // 10. WEAK / GENERIC CONTENT PENALTY
  // ==========================================

  const weakWords = [
    "hardworking",
    "punctual",
    "honest",
    "sincere",
    "good communication",
    "team player",
    "quick learner",
    "self motivated",
  ];

  const weakWordCount =
    countMatchedKeywords(
      resumeText,
      weakWords
    );

  score -= Math.min(
    weakWordCount * 1.5,
    6
  );


  // ==========================================
  // 11. MISSING IMPORTANT SECTIONS
  // ==========================================

  const missingSections = [
    !hasKeyword(resumeText, [
      "experience",
      "work experience",
      "employment",
    ]),

    !hasKeyword(resumeText, [
      "education",
      "academic",
    ]),

    !hasKeyword(resumeText, [
      "skills",
      "technical skills",
    ]),

    !hasKeyword(resumeText, [
      "projects",
      "personal projects",
    ]),
  ].filter(Boolean).length;

  score -= missingSections * 5;


  // ==========================================
  // 12. RESUME LENGTH PENALTIES
  // ==========================================

  if (wordCount < 120) {
    score -= 15;
  }

  if (wordCount >= 120 && wordCount < 180) {
    score -= 6;
  }

  if (wordCount > 1000) {
    score -= 5;
  }

  if (wordCount > 1200) {
    score -= 10;
  }


  // ==========================================
  // FINAL SCORE
  // ==========================================

  return Math.max(
    0,
    Math.min(Math.round(score), 100)
  );
};

export const calculateAtsAnalysis = (text) => {
  const totalScore = calculateAtsScore(text);

  const resumeText = text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;

  const hasExperience = hasKeyword(resumeText, [
    "experience",
    "work experience",
    "employment",
  ]);

  const hasEducation = hasKeyword(resumeText, [
    "education",
    "academic",
  ]);

  const hasSkills = hasKeyword(resumeText, [
    "skills",
    "technical skills",
    "core competencies",
  ]);

  const hasProjects = hasKeyword(resumeText, [
    "projects",
    "personal projects",
  ]);

  const technicalSkills = [
    "javascript",
    "typescript",
    "react",
    "node",
    "python",
    "java",
    "sql",
    "mongodb",
    "mysql",
    "aws",
    "azure",
    "docker",
    "git",
    "api",
  ];

  const skillCount = countMatchedKeywords(
    resumeText,
    technicalSkills
  );

  const measurableResults =
    resumeText.match(
      /\b\d+(?:\.\d+)?\s*(%|percent|users|clients|projects|years|months|hours|x)\b/gi
    ) || [];

  const specialCharacters =
    (resumeText.match(/[|{}<>[\]~`]/g) || []).length;

  const breakdown = {
    content: Math.min(
      Math.round(
        (wordCount >= 250 ? 45 : 25) +
          (wordCount >= 350 && wordCount <= 750 ? 35 : 15) +
          (measurableResults.length >= 2 ? 20 : 5)
      ),
      100
    ),

    skills: Math.min(
      Math.round((skillCount / 10) * 100),
      100
    ),

    experience: hasExperience ? 85 : 25,

    projects: hasProjects ? 85 : 20,

    formatting: Math.max(
      0,
      100 - specialCharacters * 3
    ),
  };

  return {
    total: totalScore,
    breakdown,
  };
};