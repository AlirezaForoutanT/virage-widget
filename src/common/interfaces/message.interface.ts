import { Role } from "../enums/roles";

export interface Message {
  from: Role;
  room: string;
  message: string;
  timestamp: number;
}
