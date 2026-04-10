import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

const ServerIdPage = async ({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) => {
  const { serverId } = await params;
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const server = await db.server.findFirst({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!server) {
    return redirect("/");
  }

  const initialChannel =
    server.channels.find((channel) => channel.type === ChannelType.TEXT) ??
    server.channels[0];

  if (!initialChannel) {
    return (
      <div className="flex h-full items-center justify-center bg-white text-sm text-zinc-500 dark:bg-[#313338] dark:text-zinc-400">
        Create a channel to get started.
      </div>
    );
  }

  return redirect(`/servers/${server.id}/channels/${initialChannel.id}`);
};

export default ServerIdPage;
