// src/socket/events.ts

export const CHAT = {
  // Client → Server
  SendGroup: 'sendGroupChatMessage',
  SendServer: 'sendPrivateMessage',
  Typing: 'typing',

  // Server → Client
  GroupMessage: 'groupChatMessage',
  PrivateMessage: 'privateChatMessage',

  // Errors
  Error: 'error',

  // Other
  Reply: 'reply',
} as const;

// Optionally type for convenience:
export type ChatEvt = (typeof CHAT)[keyof typeof CHAT];
