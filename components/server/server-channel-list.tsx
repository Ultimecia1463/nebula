"use client";

import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";
import { Plus, Hash, Volume2, ChevronDown } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import React from "react";

interface ServerChannelListProps {
  label: string;
  type: ChannelType;
  role?: MemberRole;
  channels: Channel[];
  server: Server;
}

const iconMap = {
  [ChannelType.TEXT]: Hash,
  [ChannelType.AUDIO]: Volume2,
};

export const ServerChannelList = ({
  label,
  type,
  role,
  channels,
  server,
}: ServerChannelListProps) => {
  const router = useRouter();
  const params = useParams();
  const { onOpen } = useModal();

  const Icon = iconMap[type];
  const isAdminOrMod = role === "ADMIN" || role === "MODERATOR";

  return (
    <div className="mb-2">
      {/* Section Header */}
      <div className="flex items-center justify-between px-3 py-2 text-xs uppercase font-semibold text-zinc-500 tracking-wide">
        <div className="flex items-center gap-x-2">
          <ChevronDown className="h-3 w-3" />
          <span>{label}</span>
        </div>
        {isAdminOrMod && (
          <button
            onClick={() => onOpen("createChannel", { server })}
            className="text-zinc-500 hover:text-zinc-300 transition"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Channel Items */}
      <div className="space-y-1 px-2">
        {channels.map((channel) => {
          const isActive = params?.channelId === channel.id;
          return (
            <button
              key={channel.id}
              onClick={() =>
                router.push(`/servers/${server.id}/channels/${channel.id}`)
              }
              className={cn(
                "group flex items-center gap-x-2 px-3 py-1.5 text-sm font-medium rounded-md w-full transition",
                isActive
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{channel.name}</span>
            </button>
          );
        })}
        {channels.length === 0 && (
          <p className="text-xs text-zinc-500 px-3 py-2 italic">
            No channels yet
          </p>
        )}
      </div>
    </div>
  );
};
