"use client";

import Image from "next/image";
import { FileText, Reply } from "lucide-react";

import type { ChannelMessage, ReplyableMessage } from "@/types";

interface MessageListProps {
  messages: ChannelMessage[];
  setReplyingTo: React.Dispatch<React.SetStateAction<ChannelMessage | null>>;
}

const getMessagePreview = (message: ReplyableMessage) => {
  if (message.content && message.content !== message.fileUrl) {
    return message.content;
  }

  if (message.fileUrl) {
    return "Attachment";
  }

  return "";
};

export default function MessageList({
  messages,
  setReplyingTo,
}: MessageListProps) {
  if (!Array.isArray(messages)) {
    return null;
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      {messages.map((message) => {
        const fileExtension = message.fileUrl?.split(".").pop()?.toLowerCase();
        const isPdf = fileExtension === "pdf";
        const isImage = Boolean(message.fileUrl) && !isPdf;
        const displayContent = getMessagePreview(message);
        const replyPreview = message.replyTo
          ? getMessagePreview(message.replyTo)
          : "";

        return (
          <div key={message.id} className="flex flex-col">
            {message.replyTo && (
              <div className="mt-1 flex flex-row gap-1 pl-10 text-[10px]">
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
                <Reply className="inline h-3 w-3 rounded bg-background/30" />
                <div className="font-semibold text-indigo-300">
                  @{message.replyTo.member.profile.name}
                </div>
                <div className="font-semibold text-gray-100">
                  {replyPreview.slice(0, 30)}
                </div>
              </div>
            )}

            <div className="group relative flex justify-between rounded items-baseline">
              <div className="min-w-0 text-xs">
                <span className="inline-block shrink-0 text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>

                <span className="ml-1.5 text-sm font-semibold text-indigo-300">
                  {message.member.profile.name}
                </span>

                {displayContent && (
                  <span className="ml-1.5 text-sm text-gray-200">
                    {displayContent}
                  </span>
                )}

                {isImage && message.fileUrl && (
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block"
                  >
                    <Image
                      src={message.fileUrl}
                      alt="Uploaded attachment"
                      width={192}
                      height={192}
                      className="rounded-md border border-white/10 object-cover"
                    />
                  </a>
                )}

                {isPdf && message.fileUrl && (
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-indigo-300 hover:bg-white/5"
                  >
                    <FileText className="h-4 w-4" />
                    Open PDF
                  </a>
                )}
              </div>

              <div className="sticky top-0 flex shrink-0 items-center rounded opacity-0 group-hover:bg-foreground/20 group-hover:opacity-100">
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
