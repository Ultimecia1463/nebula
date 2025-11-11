"use client";
import axios from "axios";
import { useState } from "react";

export default function MessageInput({
  serverId,
  channelId,
}: { serverId: string; channelId: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await axios.post(`/api/servers/${serverId}/channels/${channelId}/messages`, {
      content,
    });
    setContent("");
    setLoading(false);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="p-4 border-t border-zinc-700 flex items-center gap-2"
    >
      <input
        type="text"
        placeholder="Message #general"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 bg-zinc-800 text-white p-2 rounded-md focus:outline-none"
      />
      <button
        disabled={loading}
        type="submit"
        className="bg-indigo-500 px-4 py-2 rounded-md text-white disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
