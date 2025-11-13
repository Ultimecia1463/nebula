"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";

export default function ChannelPageClient({ serverId, channelId }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(
          `/api/servers/${serverId}/channels/${channelId}/messages`
        );
        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setMessages([]);
      }
    };

    load();
  }, [serverId, channelId]);

  if (!Array.isArray(messages)) return null;

  return (
    <div className="h-full flex flex-col justify-end">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} setReplyingTo={setReplyingTo} />
      </div>

      <MessageInput
        serverId={serverId}
        channelId={channelId}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
      />
    </div>
  );
}
