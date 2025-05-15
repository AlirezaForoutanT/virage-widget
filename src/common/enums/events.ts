// src/socket/events.ts

export const CHAT = {
  // Client → Server
  SendGroup: 'sendGroupChatMessage',
  SendServer: 'sendPrivateMessage',

  // Server → Client
  GroupMessage: 'groupChatMessage',
  PrivateMessage: 'privateChatMessage',
  Reply: 'reply',

  // Errors
  Error: 'error',

  // Other
  Typing: 'typing',
} as const;

// Optionally type for convenience:
export type ChatEvt = (typeof CHAT)[keyof typeof CHAT];
