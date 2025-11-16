"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Member } from "@prisma/client";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import { useSocket } from "@/components/providers/socket-provider";

interface ChannelPageClientProps {
  serverId: string;
  channelId: string;
  member: Member;
  channelName: string;
}

export default function ChannelPageClient({ 
  serverId, 
  channelId, 
  member,
  channelName 
}: ChannelPageClientProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const { socket, isConnected } = useSocket();

  // Load initial messages
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

  // WebSocket real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const messageKey = `chat:${channelId}:messages`;
    const updateKey = `chat:${channelId}:messages:update`;

    // Listen for new messages
    socket.on(messageKey, (message: any) => {
      setMessages((current) => [...current, message]);
    });

    // Listen for message updates
    socket.on(updateKey, (message: any) => {
      setMessages((current) =>
        current.map((item) => (item.id === message.id ? message : item))
      );
    });

    // Join the channel room
    socket.emit("join-channel", { channelId });

    return () => {
      socket.off(messageKey);
      socket.off(updateKey);
      socket.emit("leave-channel", { channelId });
    };
  }, [socket, isConnected, channelId]);

  if (!Array.isArray(messages)) return null;

  return (
    <div className="h-full flex flex-col">
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
