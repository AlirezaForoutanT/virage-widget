// src/components/ChatBubble.tsx
import { motion } from "framer-motion";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";
import { User } from "lucide-react";
import { Avatar } from "@chatscope/chat-ui-kit-react";

export interface ChatMessage {
  id: string;
  from: "user" | "ai";
  text: string;
}

interface ChatBubbleProps {
  message: ChatMessage;
}

//  A single chat message bubble with basic markdown support.

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.from === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx("flex w-full py-1", isUser && "justify-end")}
    >
      {/*AI Avatar */}
      {!isUser && (
        <div className="mr-2 shrink-0 text-primary-600 h-5 w-5">
          <Avatar src="/ai.svg" name="Virage Assistant" />
        </div>
      )}
      {/* Bubble */}

      <div
        className={clsx(
          "max-w-[75%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words",
          isUser
            ? "bg-blue-500 text-white"
            : "bg-emerald-500 dark:bg-gray-800 dark:text-gray-100"
        )}
      >
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(children as unknown as string),
                }}
              />
            ),
          }}
        >
          {message.text}
        </ReactMarkdown>
      </div>

      {/* User avatar on right */}
      {isUser && (
        <div className="ml-2 shrink-0 text-primary-600">
          <User className="h-5 w-5" />
        </div>
      )}
    </motion.div>
  );
}
