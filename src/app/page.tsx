// src/app/page.tsx
"use client";

import ChatWidget from "@/components/ChatWidget";

/**
 * Root page: render the ChatWidget full-screen, already open,
 * with no floating toggle button.
 */
export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      {/*  open chat, no button  */}
      <ChatWidget initiallyOpen showToggleButton={false} />
    </div>
  );
}
