// GeminiChatWidget.jsx
import React, { useState } from "react";
import { X, MessageCircle } from "lucide-react"; // icons
import GeminiChat from "./GeminiChat";

const GeminiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat popup */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-[500px] bg-white shadow-xl rounded-2xl flex flex-col border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-t-2xl">
            <span>Ask Ethy</span>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Chat body */}
          <div className="flex-1 overflow-y-auto p-3">
            <GeminiChat />
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiChatWidget;
