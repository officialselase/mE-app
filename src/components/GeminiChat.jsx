// src/components/GeminiChat.jsx
import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { homeSummary } from "../pages/Home";
import { workSummary } from "../pages/Work";
import { learnSummary } from "../pages/Learn";
import { shopSummary } from "../pages/Shop";
import { thoughtsSummary } from "../pages/ThoughtsPage";
import { projects } from "../pages/Projects";
import { aboutSummary } from "../pages/About";
import { Bot, User } from "lucide-react"; // icons

const GeminiChat = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi, I’m Ethel 👋. I’m Selase’s portfolio assistant. Ask me about his projects or journey!",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ✅ Initialize Gemini
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // --- Context from projects ---
  const projectsSummary = projects
    .filter((p) => !p.isIntro)
    .map((p) => `- ${p.title}: ${p.description}`)
    .join("\n");

  // --- Context from site pages ---
  const siteSummary = `
Home:
${homeSummary}

Work:
${workSummary}

Learn:
${learnSummary}

Shop:
${shopSummary}

Thoughts:
${thoughtsSummary}

About:
${aboutSummary}
`;

  // --- Personality + Context ---
  const personalityPrompt = `
You are Selase's digital assistant named Ethel.
- Speak warmly, like a Ghanaian university student who codes and mentors.
- Keep answers short but insightful, add encouragement when helpful.

You know about Selase’s portfolio pages:

${siteSummary}

You also know about Selase’s projects:

${projectsSummary}

- Important values: fair pay for fair work, creativity, and innovation.
- Never say "I am an AI", instead say "I’m Ethel, Selase’s portfolio assistant".
`;

  // --- Scroll to bottom on new messages ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // --- Handle send ---
  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", text: input, time: new Date() },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const result = await model.generateContent(
        personalityPrompt +
          "\n\nConversation:\n" +
          newMessages.map((m) => `${m.role}: ${m.text}`).join("\n")
      );

      const reply = result.response.text();
      setMessages([
        ...newMessages,
        { role: "assistant", text: reply, time: new Date() },
      ]);
    } catch (err) {
      console.error("Gemini error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-3 bg-gray-50 rounded-b-2xl">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* Avatar */}
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <Bot size={16} />
              </div>
            )}
            <div>
              <div
                className={`px-3 py-2 rounded-2xl shadow transition-opacity duration-300 ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                }`}
              >
                {m.text}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {m.time?.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            {m.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <Bot size={16} />
            </div>
            <div className="flex space-x-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t flex space-x-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Selase’s journey, projects, or pages..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default GeminiChat;
