import { Message, Server, Member, Profile } from "@prisma/client";

export type ServerWithMembersWithProfiles = Server & {
  members: (Member & { profile: Profile })[];
};

export type MessageWithMemberProfile = Message & {
  member: Member & { profile: Profile };
};

export type ReplyableMessage = MessageWithMemberProfile & {
  replyTo?: MessageWithMemberProfile | null;
};

export type ChannelMessage = MessageWithMemberProfile & {
  replyTo: ReplyableMessage | null;
};
