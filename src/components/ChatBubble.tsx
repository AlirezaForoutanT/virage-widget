// src/components/ChatBubble.tsx
import { motion } from "framer-motion";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ChatMessage {
  id: string;
  from: "user" | "ai";
  text: string;
}

interface ChatBubbleProps {
  message: ChatMessage;
}

// A single chat message bubble with basic markdown support.
export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.from === "user";
  const timeString = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx("flex w-full py-1", isUser && "justify-end")}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="mr-2 shrink-0">
          <Avatar className="h-6 w-6">
            <AvatarImage src="/ai.svg" alt="Virage Assistant" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Bubble */}
      <div
        className={clsx(
          "relative max-w-[75%] min-w-[25%] rounded-lg px-3 py-2 pb-4.5 text-sm whitespace-pre-wrap break-words",
          isUser
            ? "bg-blue-500 text-white"
            : "bg-emerald-500 dark:bg-gray-800 dark:text-gray-100"
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: (props) => (
              <a
                {...props}
                className="underline text-blue-200 hover:text-blue-100"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
          }}
        >
          {message.text}
        </ReactMarkdown>

        {/* Timestamp */}
        <span
          className={clsx(
            "absolute text-[11px] text-gray-300 bottom-0",
            isUser ? "left-1" : "right-1"
          )}
        >
          {timeString}
        </span>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="ml-2 shrink-0 text-primary-600">
          <User className="h-5 w-5" />
        </div>
      )}
    </motion.div>
  );
}
