import axios from "axios";

const OLLAMA_URL =
  process.env.OLLAMA_URL || "http://127.0.0.1:11434";

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "llama3.2";

export const askOllama = async (prompt) => {
  try {
    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt,
        stream: false,

        options: {
          temperature: 0.4,
          top_p: 0.9,
        },
      },
      {
        timeout: 120000,
      }
    );

    return response.data.response;
  } catch (error) {
    console.error(
      "Ollama Error:",
      error?.response?.data || error.message
    );

    throw new Error("Ollama AI is not available.");
  }
};