import { Channel, ChannelType, Server } from "@prisma/client";
import { create } from "zustand";
import { ServerWithMembersWithProfiles } from "@/types";
import { ChatQuery } from "@/types/chat";

export type ModalType = "createServer" | "invite" | "editServer" | "members" | "createChannel" | "editChannel" | "searchServer" | "leaveServer" | "deleteServer" | "deleteChannel" | "messageFile" | "deleteMessage";

type ModalServer = Server & {
  members?: ServerWithMembersWithProfiles["members"];
};

interface ModalData {
  server?: ModalServer;
  channel?: Channel;
  channelType?: ChannelType;
  apiUrl?: string;
  query?: ChatQuery;
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
