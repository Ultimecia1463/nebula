"use client";

import axios from "axios";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizontal } from "lucide-react";

export default function MessageInput({
  serverId,
  channelId,
  replyingTo,
  setReplyingTo,
}: any) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    await axios.post(
      `/api/servers/${serverId}/channels/${channelId}/messages`,
      {
        content,
        replyToId: replyingTo?.id || null,
      }
    );

    setContent("");
    setReplyingTo(null);
    setLoading(false);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="p-1 flex flex-col gap-2"
    >
      {/* Reply preview */}
      {replyingTo && (
        <div className="bg-[#2b2d31] border border-[#1e1f22] px-3 py-2 rounded-md text-xs flex items-center justify-between">
          <span>
            Replying to <b>{replyingTo.member.profile.name}</b>:{" "}
            <span className="italic text-gray-400">
              {replyingTo.content}
            </span>
          </span>

          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center border-accent-foreground rounded-2xl px-2 py-2 focus-within:border-blue-500 transition">

        <Input
          placeholder="Message #general"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-foreground/10 border-none shadow-none pl-4 text-white placeholder-gray-400 text-sm focus-visible:ring-0"
        />

        <Button
          disabled={loading || !content.trim()}
          type="submit"
          variant="ghost"
          size="icon"
          className={`ml-2 rounded-full h-9 w-9 transition ${
            content.trim()
              ? "bg-blue-800 text-white"
              : "bg-foreground/10 text-gray cursor-not-allowed"
          }`}
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
