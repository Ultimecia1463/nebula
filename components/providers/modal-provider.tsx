"use client";

import { CreateServerModal } from "@/components/modals/create-server-modal";
import { InviteModal } from "../modals/invite-modal";
import { CreateChannelModal } from "../modals/create-channel-modal";
import { MembersModal } from "../modals/members-modal";
import { EditChannelModal } from "../modals/edit-channel-modal";
import { SearchServerModal } from "../modals/search-server-modal";
import { useEffect, useState } from "react";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      <SearchServerModal />
    </>
  );
};
