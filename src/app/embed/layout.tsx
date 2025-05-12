// src/app/embed/layout.tsx
import type { ReactNode } from "react";

export const metadata = {
  title: "Virage Chat",
  viewport: "width=device-width, initial-scale=1",
};

export default function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="m-0 p-0 overflow-hidden">{children}</body>
    </html>
  );
}
