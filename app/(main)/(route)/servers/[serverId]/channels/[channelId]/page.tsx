import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ChatHeader from "@/components/chat/chat-header";
import ChannelPageClient from "./client";
import { ChannelMessage } from "@/types/chat";

interface ChannelPageProps {
  params: Promise<{ serverId: string; channelId: string }>;
}

const ChannelPage = async ({ params }: ChannelPageProps) => {
  const { serverId, channelId } = await params;

  const profile = await currentProfile();
  if (!profile) {
    return redirect("/");
  }

  const channel = await db.channel.findUnique({
    where: {
      id: channelId,
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

  const initialMessages = (await db.message.findMany({
    where: { channelId },
    include: {
      member: { include: { profile: true } },
      replyTo: {
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })) as ChannelMessage[];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#313338]">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />
      <ChannelPageClient 
        serverId={serverId} 
        channelId={channelId}
        channelName={channel.name}
        initialMessages={initialMessages}
      />
    </div>
  );
};

export default ChannelPage;
