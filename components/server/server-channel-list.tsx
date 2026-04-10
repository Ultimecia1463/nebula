"use client";

import {
  Channel,
  ChannelType,
  MemberRole,
  Server,
} from "@prisma/client";
import {
  Plus,
  Hash,
  Video,
  ChevronDown,
  Settings,
} from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import React from "react";
import { normalizeChannelType } from "@/lib/channel-type";

interface ServerChannelListProps {
  label: string;
  role?: MemberRole;
  channels: Channel[];
  server: Server;
}

const iconMap = {
  [ChannelType.TEXT]: Hash,
  [ChannelType.AUDIO]: Video,
  [ChannelType.VIDEO]: Video,
};

export const ServerChannelList = ({
  label,
  role,
  channels,
  server,
}: ServerChannelListProps) => {
  const router = useRouter();
  const params = useParams();
  const { onOpen } = useModal();
  const isAdminOrMod = role === "ADMIN" || role === "MODERATOR";

  return (
    <div className="mb-2">
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

      <div className="space-y-1 px-2">
        {channels.map((channel) => {
          const isActive = params?.channelId === channel.id;
          const ChannelIcon = iconMap[normalizeChannelType(channel.type)];

          return (
            <div
              key={channel.id}
              className={cn(
                "group flex items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium transition cursor-pointer",
                isActive
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              )}
            >
              <button
                onClick={() =>
                  router.push(`/servers/${server.id}/channels/${channel.id}`)
                }
                className="flex items-center gap-x-2 flex-1 text-left"
              >
                <ChannelIcon className="h-4 w-4" />
                <span className="truncate">{channel.name}</span>
              </button>

              {isAdminOrMod && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); 
                    onOpen("editChannel", { server, channel }); 
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-zinc-400 hover:text-white"
                  title="Edit Channel"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
            </div>
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
