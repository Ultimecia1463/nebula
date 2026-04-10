"use client";

import axios from "axios";
import { useState } from "react";
import { Plus, SendHorizontal, X } from "lucide-react";

import { useModal } from "@/hooks/use-modal-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChannelMessage } from "@/types";

interface MessageInputProps {
  serverId: string;
  channelId: string;
  channelName: string;
  replyingTo: ChannelMessage | null;
  setReplyingTo: React.Dispatch<React.SetStateAction<ChannelMessage | null>>;
  onMessageSent?: () => void | Promise<void>;
}

const getReplyPreview = (message: ChannelMessage) => {
  if (message.content && message.content !== message.fileUrl) {
    return message.content;
  }

  if (message.fileUrl) {
    return "Attachment";
  }

  return "";
};

export default function MessageInput({
  serverId,
  channelId,
  channelName,
  replyingTo,
  setReplyingTo,
  onMessageSent,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { onOpen } = useModal();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `/api/servers/${serverId}/channels/${channelId}/messages`,
        {
          content: trimmedContent,
          replyToId: replyingTo?.id || null,
        }
      );

      setContent("");
      setReplyingTo(null);
      await onMessageSent?.();
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 p-1">
      {replyingTo && (
        <div className="flex items-center justify-between rounded-md border border-[#1e1f22] bg-[#2b2d31] px-3 py-2 text-xs">
          <span>
            Replying to <b>{replyingTo.member.profile.name}</b>:{" "}
            <span className="italic text-gray-400">
              {getReplyPreview(replyingTo)}
            </span>
          </span>

          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="text-gray-400 transition hover:text-white"
            aria-label="Cancel reply"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center rounded-2xl border-accent-foreground px-2 py-2 transition focus-within:border-blue-500">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-zinc-300 hover:text-white"
          onClick={() =>
            onOpen("messageFile", {
              apiUrl: `/api/servers/${serverId}/channels/${channelId}/messages`,
              onSuccess: async () => {
                setReplyingTo(null);
                await onMessageSent?.();
              },
            })
          }
          aria-label="Attach a file"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Input
          placeholder={`Message #${channelName}`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={loading}
          className="border-none bg-foreground/10 pl-4 text-sm text-white shadow-none placeholder-gray-400 focus-visible:ring-0"
        />

        <Button
          disabled={loading || !content.trim()}
          type="submit"
          variant="ghost"
          size="icon"
          className={`ml-2 h-9 w-9 rounded-full transition ${
            content.trim()
              ? "bg-blue-800 text-white"
              : "cursor-not-allowed bg-foreground/10 text-gray"
          }`}
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
