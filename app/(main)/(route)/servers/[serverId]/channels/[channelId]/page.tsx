import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ChatHeader from "@/components/chat/chat-header";
import ChannelPageClient from "./client";
import { ChannelType } from "@prisma/client";
import { MediaRoom } from "@/components/media/media-room";
import { normalizeChannelType } from "@/lib/channel-type";

interface ChannelPageProps {
  params: Promise<{ serverId: string; channelId: string }>;
}

const ChannelPage = async ({ params }: ChannelPageProps) => {
  const { serverId, channelId } = await params;

  const profile = await currentProfile();
  if (!profile) {
    return redirect("/");
  }

  const channel = await db.channel.findFirst({
    where: {
      id: channelId,
      serverId,
    },
  });

  const member = await db.member.findFirst({
    where: {
      serverId: serverId,
      profileId: profile.id,
    },
  });

  if (!channel || !member) {
    redirect("/");
  }

  const normalizedChannelType = normalizeChannelType(channel.type);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#313338]">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
        channelType={normalizedChannelType}
      />
      {normalizedChannelType === ChannelType.TEXT ? (
        <ChannelPageClient
          serverId={serverId}
          channelId={channelId}
          channelName={channel.name}
        />
      ) : (
        <MediaRoom channelId={channelId} channelName={channel.name} />
      )}
    </div>
  );
};

export default ChannelPage;
