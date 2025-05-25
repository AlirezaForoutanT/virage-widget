import { RoomKey } from "@/common/enums/rooms.enum";

export const orgRoom = (orgId: string): string => `${RoomKey.ORG}|${orgId}`;

export const conversationRoom = (convId: string, orgId: string): string =>
  `${RoomKey.CONVERSATION}|${convId}|${orgId}`;

export const userRoom = (
  orgId: string,
  userId: string,
  topic: string,
): string => `${RoomKey.USER}|${orgId}|${userId}|${topic}`;

export const topicRoom = (topic: string): string => `${RoomKey.TOPIC}|${topic}`;
