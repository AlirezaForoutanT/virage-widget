// src/components/ChatWidget.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Send, MessageCircle } from "lucide-react";
import { FaTimes } from "react-icons/fa";

import clsx from "clsx";

import ChatBubble, { ChatMessage } from "./ChatBubble";

import { getSocket } from "@/utils/socket";
import type { Socket } from "socket.io-client";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [dotCount, setDotCount] = useState(1);
  const [userId, setUserId] = useState<string>();

  const socketRef = useRef<Socket | null>(null);

  /* ───────────────────────────────────────
     1.  Get the Socket.IO client once and register listeners
  ─────────────────────────────────────── */
  useEffect(() => {
    let mounted = true;

    (async () => {
      const s = await getSocket();

      const tok = localStorage.getItem("virage_jwt")!;
      const payload = JSON.parse(atob(tok.split(".")[1]));
      setUserId(payload.sub);

      if (!mounted) return;
      socketRef.current = s;

      /** Incoming message → animate */
      const onPrivate = (msg: { data: string }) => {
        setTyping(false);
        animateResponse(msg.data);
      };

      s.on("privateChatMessage", onPrivate);
      s.on("userTyping", () => setTyping(true));
      s.on("stoppedTyping", () => setTyping(false));

      // Cleanup when component unmounts
      return () => {
        s.off("privateChatMessage", onPrivate);
        s.off("userTyping", () => setTyping(true));
        s.off("stoppedTyping", () => setTyping(false));
      };
    })();

    return () => {
      mounted = false;
    };
  }, []);

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

  /* ───────────────────────────────────────
     Helper: animate AI reply letter-by-letter
  ─────────────────────────────────────── */
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
      }
    }, 20);
  };

  /* ───────────────────────────────────────
     Send chat message
  ─────────────────────────────────────── */
  const handleSend = () => {
    const text = input.trim();
    if (!text || !socketRef.current) return;

    const id = crypto.randomUUID();
    setMessages((prev) => [...prev, { id, from: "user", text }]);

    const s = socketRef.current;

    // Tell server we stopped typing
    s.emit("typing", {
      userId,
      typing: false,
    });

    // Send the actual message
    s.emit("sendPrivateMessage", {
      userId,
      message: text,
    });

    setInput("");
  };

  /* ───────────────────────────────────────
     On user keystroke → emit typing event (debounced 300 ms)
  ─────────────────────────────────────── */
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleInputChange = (val: string) => {
    setInput(val);
    if (!socketRef.current) return;

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    socketRef.current.emit("typing", {
      userId,
      typing: true,
    });
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit("typing", {
        userId,
        typing: false,
      });
    }, 3_000);
  };

  /* ───────────────────────────────────────
     Render
  ─────────────────────────────────────── */
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

            {/* Messages */}
            <div
              ref={listRef}
              className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar"
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

            {/* Input */}
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
                onChange={(e) => handleInputChange(e.target.value)}
              />
              <button
                type="submit"
                className={clsx(
                  "rounded-md p-2 text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800",
                  !input.trim() && "cursor-not-allowed opacity-30"
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
