import { MemberRole, Server } from "@prisma/client";

export interface ChatProfile {
  id: string;
  name: string;
  imageUrl: string;
  email?: string;
  userId?: string;
}

export interface ChatMember {
  id: string;
  role: MemberRole;
  profile: ChatProfile;
}

export interface ChatReply {
  id: string;
  content: string;
  member: ChatMember;
}

export interface ChannelMessage {
  id: string;
  content: string;
  fileUrl: string | null;
  deleted: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  member: ChatMember;
  replyTo: ChatReply | null;
}

export type ChatQuery = Record<string, string>;

export type SearchServerResult = Pick<
  Server,
  "id" | "name" | "imageUrl" | "inviteCode"
>;
