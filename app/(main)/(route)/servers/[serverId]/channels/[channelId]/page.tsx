import { currentProfile } from "@/lib/current-profile";
import ChannelPageClient from "./client";

interface ChannelPageProps {
  params: Promise<{ serverId: string; channelId: string }>;
}

const ChannelPage = async ({ params }: ChannelPageProps) => {
  const { serverId, channelId } = await params;

  const profile = await currentProfile();
  if (!profile) return null;

  return (
    <div className="flex flex-col h-full bg-[#313338]">
      <ChannelPageClient serverId={serverId} channelId={channelId} />
    </div>
  );
};

export default ChannelPage;
