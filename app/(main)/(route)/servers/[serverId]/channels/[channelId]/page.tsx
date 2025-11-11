import React from "react";

interface ChannelPageProps {
  params: Promise<{ serverId: string; channelId: string }>;
}

const ChannelPage = async ({ params }: ChannelPageProps) => {
  const { serverId, channelId } = await params;

  return (
    <div className="flex items-center justify-center h-full text-zinc-400">
      <h2>
        Welcome to{" "}
        <span className="font-semibold text-white">#{channelId}</span> in server{" "}
        <span className="font-semibold text-white">{serverId}</span>
      </h2>
    </div>
  );
};

export default ChannelPage;
