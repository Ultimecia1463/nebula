import { ChannelType } from "@prisma/client";

export type MediaChannelType = Exclude<ChannelType, "TEXT">;

export type LiveKitParticipantMetadata = {
  memberId: string;
  profileId: string;
  imageUrl: string | null;
  channelId: string;
  channelType: MediaChannelType;
};

export type LiveKitConnectionDetails = {
  token: string;
  serverUrl: string;
  roomName: string;
  channelId: string;
  channelType: MediaChannelType;
};
