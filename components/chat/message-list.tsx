"use client";

import { Dispatch, SetStateAction } from "react";
import { Reply } from "lucide-react";
import { ChannelMessage } from "@/types/chat";

interface MessageListProps {
  messages: ChannelMessage[];
  setReplyingTo: Dispatch<SetStateAction<ChannelMessage | null>>;
}

export default function MessageList({
  messages,
  setReplyingTo,
}: MessageListProps) {
  if (!Array.isArray(messages)) return null;

  return (
    <div className="flex flex-col p-4 overflow-y-auto h-full">
      {messages.map((message) => {
        return (
          <div key={message.id} className="flex flex-col">
            {message.replyTo && (
              <div className="mt-1 text-[10px] flex flex-row gap-1 pl-10">
                <svg
                  width="40"
                  height="10"
                  viewBox="0 0 60 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline translate-y-1.5"
                >
                  <path
                    d="M5 20 V10 C5 5 8 2 13 2 H60"
                    stroke="#555"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
                <Reply className="inline h-3 w-3 bg-background/30 rounded" />
                <div className="font-semibold text-indigo-300">
                  @{message.replyTo.member.profile.name}
                </div>
                <div className="font-semibold text-gray-100">
                  {message.replyTo.content.slice(0, 20)}
                </div>
              </div>
            )}

            <div className="group relative flex justify-between items-baseline rounded">
              <div className="min-w-0 text-xs">
                <span className="text-gray-500 text-xs inline-block shrink-0">
                  {new Date(message.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>

                <span className="font-semibold text-sm text-indigo-300 ml-1.5">
                  {message.member.profile.name}
                </span>

                <span className="ml-1.5 text-sm text-gray-200">
                  {message.content}
                </span>
              </div>

              <div className="opacity-0 group-hover:opacity-100 group-hover:bg-foreground/20 shrink-0 sticky top-0 rounded flex items-center">
                <button
                  onClick={() => setReplyingTo(message)}
                  className="p-1 text-gray-300 hover:text-white"
                  title="Reply"
                >
                  <Reply className="h-2 w-2" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
