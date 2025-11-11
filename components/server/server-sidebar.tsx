import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";
import ServerHeader from "./server-header";
import { ServerChannelList } from "./server-channel-list";

interface ServerSidebarProps {
  serverId: string;
}

const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile();
  if (!profile) return redirect("/");

  const server = await db.server.findFirst({
    where: { id: serverId },
    include: {
      channels: { orderBy: { createdAt: "asc" } },
      members: { include: { profile: true }, orderBy: { role: "asc" } },
    },
  });
  if (!server) return redirect("/");

  const role = server.members.find((m) => m.profileId === profile.id)?.role;
  const textChannels = server.channels.filter(
    (c) => c.type === ChannelType.TEXT
  );
  const audioChannels = server.channels.filter(
    (c) => c.type === ChannelType.AUDIO
  );

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader server={server} role={role} />

      <div className="flex-1 overflow-y-auto mt-2">
        <ServerChannelList
          label="Text Channels"
          type={ChannelType.TEXT}
          channels={textChannels}
          role={role}
          server={server}
        />
        <ServerChannelList
          label="AUDIO Channels"
          type={ChannelType.AUDIO}
          channels={audioChannels}
          role={role}
          server={server}
        />
      </div>
    </div>
  );
};

export default ServerSidebar;
