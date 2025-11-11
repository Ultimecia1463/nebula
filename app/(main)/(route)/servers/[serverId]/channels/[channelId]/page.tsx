import React from "react";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import MessageInput from "@/components/chat/message-input";
import MessageList from "@/components/chat/message-list";

interface ChannelPageProps {
  params: Promise<{ serverId: string; channelId: string }>;
}

const ChannelPage = async ({ params }: ChannelPageProps) => {
  const { serverId, channelId } = await params;
  const profile = await currentProfile();
  if (!profile) return null;

  const messages = await db.message.findMany({
    where: { channelId },
    include: {
      member: { include: { profile: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="h-full flex flex-col justify-end">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      <MessageInput serverId={serverId} channelId={channelId} />
    </div>

  );
};

export default ChannelPage;
