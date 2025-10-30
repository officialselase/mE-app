// src/components/GeminiChat.jsx
import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Bot, User } from "lucide-react"; // icons
import { portfolioContext } from "../data/portfolioContext";

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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  // --- Context from portfolio data ---
  const projectsContext = portfolioContext.projects.map(project => 
    `${project.title}: ${project.description} (Technologies: ${project.technologies.join(', ')})`
  ).join('\n\n');

  // --- Context from site pages ---
  const siteSummary = `
Home:
Welcome to Selase's portfolio! This is a comprehensive showcase of his work as a full-stack developer, featuring projects, thoughts, work experience, and a learning platform. The site demonstrates modern web development practices with React, Django, and various cutting-edge technologies.

Work:
Selase has extensive experience in full-stack development, working with modern technologies like React, Django, Node.js, and cloud platforms. His work spans from frontend development to backend architecture and DevOps practices.

Learn:
An interactive learning platform inspired by The Odin Project, where students can enroll in courses, complete assignments, and share their work with the community. Features include course progression tracking, assignment submissions, and peer collaboration.

Shop:
E-commerce functionality (coming soon) that will showcase Selase's ability to build complete commercial applications with payment processing, inventory management, and order fulfillment.

Thoughts:
A collection of blog posts and technical articles where Selase shares insights about web development, best practices, and his learning journey. Topics include React patterns, Django architecture, and modern development workflows.

About:
Learn more about Selase's background, skills, and passion for creating innovative web solutions. Discover his journey from learning to professional development and his commitment to continuous improvement.

Projects:
A showcase of Selase's portfolio projects demonstrating various skills including full-stack web applications, API development, database design, and modern frontend frameworks. Each project includes live demos and source code.
`;

  // --- Personality + Context ---
  const personalityPrompt = `
You are Selase's digital assistant named Ethel.
- Speak warmly, like a Ghanaian university student who codes and mentors.
- Keep answers short but insightful, add encouragement when helpful.

You know about Selase’s portfolio pages:

${siteSummary}

You also know about Selase’s projects:

${projectsContext}

Skills: ${portfolioContext.skills.frontend.join(', ')} (Frontend), ${portfolioContext.skills.backend.join(', ')} (Backend)

- Important values: fair pay for fair work, creativity, and innovation.
- Never say "I am an AI", instead say "I’m Ethel, Selase’s portfolio assistant".
`;

  // --- Scroll to bottom on new messages ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // --- Handle send ---
  const handleSend = async () => {
    if (!input.trim()) {return;}

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
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
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
