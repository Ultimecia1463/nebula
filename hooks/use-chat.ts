"use client";

import { useSocket } from "@/components/providers/socket-provider";
import { useEffect, useState } from "react";

type Message = {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: Date;
  member: {
    id: string;
    role: string;
    profile: {
      id: string;
      name: string;
      imageUrl: string;
    };
  };
  replyTo?: Message | null;
};

type UseChatProps = {
  channelId: string;
  initialMessages: Message[];
};

export const useChat = ({ channelId, initialMessages }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!socket || !channelId) return;

    const channelKey = `channel:${channelId}:messages`;

    // Join the channel room
    socket.emit("join-channel", channelId);
    console.log(`📢 Joined channel room: ${channelId}`);

    // Listen for new messages
    const messageHandler = (message: Message) => {
      console.log(`📨 Received message in channel ${channelId}:`, message);
      setMessages((prev) => {
        // Check if message already exists
        if (prev.find((m) => m.id === message.id)) {
          console.log(`⚠️ Message ${message.id} already exists, skipping`);
          return prev;
        }
        return [...prev, message];
      });
    };

    socket.on(channelKey, messageHandler);

    return () => {
      socket.emit("leave-channel", channelId);
      socket.off(channelKey, messageHandler);
      console.log(`👋 Left channel room: ${channelId}`);
    };
  }, [socket, channelId]);

  return {
    messages,
    isConnected,
  };
};
