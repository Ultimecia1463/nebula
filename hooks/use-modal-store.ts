import { Channel, ChannelType, Server } from "@prisma/client";
import { create } from "zustand";
import type { ServerWithMembersWithProfiles } from "@/types";

export type ModalType =
  | "createServer"
  | "invite"
  | "members"
  | "createChannel"
  | "editChannel"
  | "messageFile";

interface ModalData {
  server?: Server | ServerWithMembersWithProfiles;
  channel?: Channel;
  channelType?: ChannelType;
  apiUrl?: string;
  query?: Record<string, unknown>;
  onSuccess?: () => void | Promise<void>;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) =>
    set({
      isOpen: true,
      type,
      data,
    }),
  onClose: () =>
    set({
      type: null,
      isOpen: false,
    }),
}));
