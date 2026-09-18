
import { useState } from "react";
import { chatWithAI } from "../../api/authApi";

export const InterviewPractice = () => {
  const [selectedField, setSelectedField] = useState("frontend");

  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");

  const [aiThinking, setAiThinking] = useState(false);

  // chat | interview
  const [mode, setMode] = useState("chat");

  const [interviewId, setInterviewId] = useState(null);

  const [difficulty, setDifficulty] = useState("medium");

  const [message, setMessage] = useState("");

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSendMessage = async () => {
    const text = input.trim();

    if (!text || aiThinking) {
      return;
    }

    // -----------------------------------------
    // User message
    // -----------------------------------------

    const userMessage = {
      role: "user",
      type: mode === "interview" ? "answer" : "question",
      content: text,
    };

    // Show user message immediately
    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setMessage("");
    setAiThinking(true);

    try {
      // -----------------------------------------
      // Conversation for UI context
      // -----------------------------------------

      const conversation = [
        ...messages,
        userMessage,
      ].map((msg) => ({
        role: msg.role,
        type: msg.type,
        content: msg.content,
      }));

      // -----------------------------------------
      // ALWAYS CALL CHAT API
      // -----------------------------------------
      //
      // Backend decides:
      //
      // normal chat
      // start interview
      // interview answer
      // end interview
      //
      // Frontend does NOT decide.
      // -----------------------------------------

      const response = await chatWithAI({
        message: text,
        field: selectedField,
        interviewId,
        conversation,
      });

      const data = response.data;

      // =================================================
      // NORMAL CHAT
      // =================================================

      if (
        data.mode === "chat" &&
        data.action !== "completed"
      ) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            type: "answer",
            content:
              data.answer ||
              "I couldn't generate a response.",
          },
        ]);

        return;
      }

      // =================================================
      // INTERVIEW STARTED
      // =================================================

      if (
        data.mode === "interview" &&
        data.action === "started"
      ) {
        setMode("interview");

        setInterviewId(data.interviewId);

        setDifficulty(
          data.difficulty || "medium"
        );

        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            type: "question",
            content: data.question,
            difficulty:
              data.difficulty || "medium",
          },
        ]);

        return;
      }

      // =================================================
      // INTERVIEW ANSWER EVALUATED
      // =================================================

      if (
        data.mode === "interview" &&
        data.action === "answer_evaluated"
      ) {
        setMode("interview");

        setInterviewId(data.interviewId);

        setDifficulty(
          data.difficulty || "medium"
        );

        // Feedback
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            type: "feedback",
            content:
              data.feedback ||
              "Your answer has been evaluated.",
            score: data.score,
          },

          // Next question
          {
            role: "ai",
            type: "question",
            content: data.nextQuestion,
            difficulty:
              data.difficulty || "medium",
          },
        ]);

        return;
      }

      // =================================================
      // INTERVIEW COMPLETED
      // =================================================

      if (
        data.action === "completed"
      ) {
        setMode("chat");

        setInterviewId(null);

        setDifficulty("medium");

        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            type: "feedback",
            content:
              data.message ||
              `Interview completed. Your final score is ${data.finalScore}/100.`,
            score: data.finalScore,
          },
        ]);

        return;
      }

      // =================================================
      // FALLBACK
      // =================================================

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          type: "answer",
          content:
            data.answer ||
            data.message ||
            "I couldn't understand your request.",
        },
      ]);
    } catch (error) {
      console.error(
        "AI Chat Error:",
        error
      );

      setMessage(
        error?.response?.data?.message ||
          "AI could not process your message."
      );
    } finally {
      setAiThinking(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="px-6 py-4 border-b flex items-center justify-between">

        <div>
          <h2 className="font-bold text-lg">
            AI Assistant
          </h2>

          {/* <p className="text-sm text-gray-500">
            {selectedField}
            {" • "}
            {mode === "interview"
              ? `Interview • ${difficulty}`
              : "AI Chat"}
          </p> */}
        </div>

        <div className="flex items-center gap-2">

          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

          <span className="text-sm text-gray-600">
            AI Online
          </span>

        </div>
      </div>

      {/* =================================================
          FIELD SELECTOR
      ================================================= */}

      {/* <div className="px-6 py-3 border-b">

        <select
          value={selectedField}
          onChange={(e) =>
            setSelectedField(e.target.value)
          }
          disabled={mode === "interview"}
          className="border border-gray-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
        >

          <option value="frontend">
            Frontend Developer
          </option>

          <option value="backend">
            Backend Developer
          </option>

          <option value="fullstack">
            Full Stack Developer
          </option>

          <option value="javascript">
            JavaScript Developer
          </option>

          <option value="react">
            React Developer
          </option>

        </select>

      </div> */}

      {/* =================================================
          CHAT AREA
      ================================================= */}

      <div className="h-[500px] overflow-y-auto p-6 space-y-5">

        {/* EMPTY STATE */}

        {!messages.length && (
          <div className="h-full flex flex-col items-center justify-center text-center">

            <div className="text-5xl mb-4">
              🤖
            </div>

            <h3 className="text-2xl font-bold">
              AI Interview Assistant
            </h3>

            <p className="text-gray-500 mt-2 max-w-md">
              Ask me anything or say{" "}
              <span className="font-semibold text-gray-700">
                "take my interview"
              </span>{" "}
              to start a mock interview.
            </p>

          </div>
        )}

        {/* =================================================
            MESSAGES
        ================================================= */}

        {messages.map((msg, index) => (
          <div
            key={`${index}-${msg.type}`}
            className={`flex ${
              msg.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >

            <div
              className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                msg.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >

              {/* FEEDBACK */}

              {msg.type === "feedback" && (
                <div className="text-xs font-semibold text-purple-600 mb-2">
                  AI Feedback
                  {msg.score !== null &&
                  msg.score !== undefined
                    ? ` • ${msg.score}/100`
                    : ""}
                </div>
              )}

              {/* INTERVIEW QUESTION */}

              {msg.type === "question" &&
                msg.role === "ai" && (
                  <div className="text-xs font-semibold text-gray-500 mb-2">
                    AI Interviewer
                  </div>
                )}

              {/* MESSAGE */}

              <p className="leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>

              {/* DIFFICULTY */}

              {msg.type === "question" &&
                msg.role === "ai" &&
                msg.difficulty && (
                  <div className="mt-3 text-xs text-gray-500">
                    Difficulty:{" "}
                    {msg.difficulty}
                  </div>
                )}

            </div>
          </div>
        ))}

        {/* =================================================
            AI THINKING
        ================================================= */}

        {aiThinking && (
          <div className="flex justify-start">

            <div className="bg-gray-100 rounded-2xl px-5 py-4">

              <div className="flex gap-1 text-gray-400">

                <span>●</span>
                <span>●</span>
                <span>●</span>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {message && (
        <div className="px-6 py-2 text-sm text-red-500">
          {message}
        </div>
      )}

      {/* =================================================
          INPUT
      ================================================= */}

      <div className="border-t p-4">

        <div className="flex items-end gap-3">

          <textarea
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) => {

              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();

                handleSendMessage();
              }

            }}
            rows={2}
            placeholder={
              mode === "interview"
                ? "Answer the interview question or type 'stop interview'..."
                : "Ask anything or say 'take my interview'..."
            }
            className="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <button
            onClick={handleSendMessage}
            disabled={
              !input.trim() ||
              aiThinking
            }
            className="h-12 px-5 rounded-xl bg-purple-600 text-white font-semibold disabled:opacity-50"
          >
            {aiThinking
              ? "Thinking..."
              : "Send"}
          </button>

        </div>

        <p className="text-xs text-gray-400 mt-2">
          Enter to send • Shift + Enter for new line
        </p>

      </div>

    </div>
  );
};
