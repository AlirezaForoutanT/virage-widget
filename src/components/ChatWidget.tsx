// src/components/ChatWidget.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Send, Smile } from "lucide-react";

import clsx from "clsx";

import ChatBubble, { ChatMessage } from "./ChatBubble";

import { getSocket } from "@/utils/socket";
import type { Socket } from "socket.io-client";

import { CountdownCircleTimer } from "react-countdown-circle-timer";
import EmojiPicker, { Theme, EmojiClickData } from "emoji-picker-react";

export default function ChatWidget({}: // initiallyOpen = false,
{
  initiallyOpen?: boolean;
  showToggleButton?: boolean;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [messageTimeOut, setMessageTimeOut] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [dotCount, setDotCount] = useState(1);
  const [userId, setUserId] = useState<string>();
  const [showPicker, setShowPicker] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertEmoji = (emoji: string) => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newText = input.slice(0, start) + emoji + input.slice(end);
    setInput(newText);
    // restore caret after React updates
    setTimeout(() => {
      el.setSelectionRange(start + emoji.length, start + emoji.length);
      el.focus();
    }, 0);
  };
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
      s.on("error", async (msg: unknown) => {
        console.error("[ws] error:", msg);
        if (msg === "Too many messages") {
          setMessageTimeOut(true);
          setInput("");
        }
      });

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
    setMessages((prev) => [
      ...prev,
      { id, from: "ai", text: "", ts: Date.now() },
    ]);
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
    setMessages((prev) => [
      ...prev,
      { id, from: "user", text, ts: Date.now() },
    ]);
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
      {/* Chat panel */}
      <AnimatePresence>
        <motion.div
          key="chat-panel"
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed z-50 flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-primary-600 px-3 py-2 text-white">
            <span>Virage Assistant</span>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            className="flex-1 space-y-2 overflow-y-auto px-3 py-2 chat-scrollbar"
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
            className="relative flex items-center gap-2 border-t border-gray-200 p-2 dark:border-gray-700"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <div className="relative flex-1">
              <textarea
                className={clsx(
                  "w-full resize-none max-h-24 rounded-md border px-2 py-2 text-sm focus:outline-none",
                  messageTimeOut
                    ? "border-green-500 placeholder-green-800  bg-red-50 dark:bg-green-500 placeholder:font-bold"
                    : "border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                )}
                placeholder={
                  messageTimeOut ? "Please wait 5 seconds" : "Write a message…"
                }
                value={input}
                rows={1}
                ref={textareaRef}
                disabled={messageTimeOut}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !messageTimeOut) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                onChange={(e) => handleInputChange(e.target.value)}
              />
              {/* Emoji button */}
              <button
                type="button"
                className="absolute top-4.5 right-2 -translate-y-1/2 rounded p-1 cursor-pointer text-primary-600 hover:text-amber-300 dark:hover:bg-gray-800"
                onClick={() => setShowPicker((v) => !v)}
              >
                <Smile className="h-4.5 w-4.5" />
              </button>
            </div>
            {/* Picker pop-up */}
            {showPicker && (
              <div
                className="absolute bottom-15 z-50 chat-scrollbar"
                style={{ "--epr-emoji-size": "6px" } as React.CSSProperties}
              >
                <EmojiPicker
                  reactionsDefaultOpen={true}
                  theme={Theme.DARK}
                  onEmojiClick={(emojiData: EmojiClickData) => {
                    insertEmoji(emojiData.emoji);
                    setShowPicker(false);
                  }}
                  searchDisabled={true}
                  previewConfig={{ showPreview: false }}
                  width={300}
                  height={315}
                  style={
                    {
                      "--epr-emoji-size": "20px",
                    } as React.CSSProperties
                  }
                ></EmojiPicker>
              </div>
            )}
            <button
              type="submit"
              className="rounded-md p-2 text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 mb-1.5"
              disabled={!input.trim() || messageTimeOut}
            >
              {messageTimeOut ? (
                <div>
                  <CountdownCircleTimer
                    duration={5}
                    colors="#1f8703"
                    size={20}
                    strokeWidth={1}
                    trailStrokeWidth={2}
                    isPlaying={messageTimeOut}
                    onComplete={() => {
                      setMessageTimeOut(false);
                    }}
                  >
                    {/* {({ remainingTime }) => remainingTime} */}
                  </CountdownCircleTimer>
                </div>
              ) : (
                <Send
                  className={clsx(
                    "h5 w5",
                    !input.trim() && "cursor-not-allowed opacity-30"
                  )}
                />
              )}
            </button>
          </form>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
