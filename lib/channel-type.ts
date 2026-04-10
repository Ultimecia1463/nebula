import { ChannelType } from "@prisma/client";

export const normalizeChannelType = (type: ChannelType): ChannelType =>
  type === ChannelType.AUDIO ? ChannelType.VIDEO : type;

export const isMediaChannelType = (type: ChannelType) =>
  normalizeChannelType(type) === ChannelType.VIDEO;
