// src/app/embed/layout.tsx
import type { ReactNode } from "react";

import { AuthProvider } from "@/providers/AuthProvider";
import { SocketProvider } from "@/providers/SocketProvider";

export const metadata = {
  title: "Virage Chat",
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="m-0 p-0 overflow-hidden">
        <AuthProvider>
          <SocketProvider>{children}</SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}