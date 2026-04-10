"use client";

import { CreateServerModal } from "@/components/modals/create-server-modal";
import { InviteModal } from "../modals/invite-modal";
import { CreateChannelModal } from "../modals/create-channel-modal";
import { MembersModal } from "../modals/members-modal";
import { EditChannelModal } from "../modals/edit-channel-modal";
import { MessageFileModal } from "../modals/message-file-modal";
import { useMounted } from "@/hooks/use-mounted";

export const ModalProvider = () => {
  const isMounted = useMounted();

  if (!isMounted){
    return null;
  }

  return (
    <>
      <CreateServerModal />
      <InviteModal />
      <CreateChannelModal />
      <MembersModal />
      <EditChannelModal />
      <MessageFileModal />
    </>
  );
};
