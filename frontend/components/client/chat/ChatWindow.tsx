"use client";

import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ChatMessageMock, ChatRoomMock } from "@/constants";

type ChatWindowProps = {
  room: ChatRoomMock | null;
  messages: ChatMessageMock[];
  onSendMessage: (content: string) => void;
  onBack?: () => void;
};

export default function ChatWindow({
  room,
  messages,
  onSendMessage,
  onBack,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, room?.id]);

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">
          Select a conversation to start chatting.
        </p>
      </div>
    );
  }

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    onSendMessage(content);
    setInput("");
  };

  return (
    <section className="flex-1 flex flex-col bg-white">
      <header className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back to conversations"
            title="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-[#EE4D2D] to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          <span>{room.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base truncate">
            {room.name}
          </h3>
          <p className="text-xs text-gray-500">Typically replies within minutes</p>
        </div>
      </header>

      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">
              No messages yet. Send a message to start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender === "me";
            return (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  isOwn ? "justify-end items-end" : "justify-start items-start"
                }`}
              >
                {!isOwn && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-linear-to-br from-[#EE4D2D] to-orange-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                    <span>{room.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div
                  className={`max-w-[75%] md:max-w-[65%] rounded-lg px-3 py-2 text-sm leading-relaxed shadow-sm ${
                    isOwn
                      ? "bg-[#EE4D2D] text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      <footer className="border-t border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Write a message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]/30"
          />
          <button
            type="button"
            onClick={handleSend}
            className="h-10 w-10 rounded-full bg-[#EE4D2D] flex items-center justify-center text-white hover:bg-[#EE4D2D]/90 transition-colors"
            aria-label="Send message"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </section>
  );
}

