// src/components/ChatWidget.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle } from "lucide-react";
import clsx from "clsx";
import { getSocket } from "@/utils/socket";
import ChatBubble, { ChatMessage } from "./ChatBubble";
import { FaTimes } from "react-icons/fa";

interface ChatWidgetProps {
  userId: string;
}

export default function ChatWidget(props: ChatWidgetProps) {
  const { userId } = props;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [dotCount, setDotCount] = useState(1);

  // Singleton WebSocket client
  const socketRef = useRef(getSocket());

  // Scroll to bottom whenever messages or typing flag change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, typing]);

  //typing animation
  // Animate the typing indicator with a dot count (1-3)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (typing) {
      timer = setInterval(() => {
        setDotCount((c) => (c % 3) + 1);
      }, 250);
    } else {
      setDotCount(1);
    }
    return () => clearInterval(timer);
  }, [typing]);

  // Register socket listeners
  useEffect(() => {
    const s = socketRef.current;

    s.on("privateChatMessage", (msg: { data: string }) => {
      setTyping(false);
      animateResponse(msg.data);
    });

    // Helper to animate the AI response
    const animateResponse = (fullText: string) => {
      const id = crypto.randomUUID();
      setMessages((prev) => [...prev, { id, from: "ai", text: "" }]);
      let idx = 0;
      const interval = setInterval(() => {
        idx++;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, text: fullText.slice(0, idx) } : m
          )
        );
        if (idx >= fullText.length) {
          clearInterval(interval);
          setMessages((prev) => prev.map((m) => (m.id === id ? { ...m } : m)));
        }
      }, 50);
    };

    s.on("userTyping", () => setTyping(true));
    s.on("stoppedTyping", () => setTyping(false));

    return () => {
      s.off("privateChatMessage");
      s.off("userTyping");
      s.off("stoppedTyping");
    };
  }, []);

  // Handle form submit
  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const id = crypto.randomUUID();
    setMessages((prev) => [...prev, { id, from: "user", text }]);
    const s = socketRef.current;

    // Immediately notify server that user stopped typing
    s.emit("stoppedTyping", {
      userId,
    });

    // Send the actual message
    s.emit("sendPrivateMessage", {
      userId,
      message: text,
    });

    setInput("");
  };

  return (
    <>
      {/* Floating chat button */}
      <button
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg focus:outline-none"
        onClick={() => setOpen((o) => !o)}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-20 right-6 z-50 flex h-96 w-80 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-primary-600 px-3 py-2 text-white">
              <span>Virage Assistant</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="hover:opacity-80"
              >
                <FaTimes />
              </button>
            </div>

            {/* Messages list */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar"
            >
              {messages.map((m) => (
                <ChatBubble key={m.id} message={m} />
              ))}
              {typing && (
                <ChatBubble
                  message={{
                    id: "typing",
                    from: "ai",
                    text: ".".repeat(dotCount),
                  }}
                />
              )}
            </div>

            {/* Input area */}
            <form
              className="flex items-center gap-1 border-t border-gray-200 p-2 dark:border-gray-700"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Write a message…"
                value={input}
                onChange={(e) => {
                  const val = e.target.value;
                  setInput(val);
                  socketRef.current.emit("typing", {
                    userId,
                  });
                }}
              />
              <button
                type="submit"
                className={clsx(
                  "rounded-md p-2 text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800",
                  !input.trim() && "opacity-30 cursor-not-allowed"
                )}
                disabled={!input.trim()}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
