"use client";

import { useEffect, useEffectEvent, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import { useSocket } from "@/components/providers/socket-provider";
import { ChannelMessage } from "@/types/chat";

interface ChannelPageClientProps {
  serverId: string;
  channelId: string;
  channelName: string;
  initialMessages: ChannelMessage[];
}

export default function ChannelPageClient({ 
  serverId, 
  channelId, 
  channelName,
  initialMessages,
}: ChannelPageClientProps) {
  const [messages, setMessages] = useState<ChannelMessage[]>(initialMessages);
  const [replyingTo, setReplyingTo] = useState<ChannelMessage | null>(null);
  const [isStreamConnected, setIsStreamConnected] = useState(false);
  const { setRealtimeState } = useSocket();
  const { isLoaded, isSignedIn } = useAuth();

  const loadMessages = useEffectEvent(async () => {
    try {
      const res = await axios.get<ChannelMessage[]>(
        `/api/servers/${serverId}/channels/${channelId}/messages`
      );
      setMessages(res.data || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  });

  useEffect(() => {
    setRealtimeState({
      isConnected: isStreamConnected,
      transport: isStreamConnected ? "sse" : "polling",
    });

    return () => {
      setRealtimeState({
        isConnected: false,
        transport: "none",
      });
    };
  }, [isStreamConnected, setRealtimeState]);

  const upsertMessage = (message: ChannelMessage) => {
    setMessages((current) => {
      const existingIndex = current.findIndex((item) => item.id === message.id);

      if (existingIndex === -1) {
        return [...current, message];
      }

      return current.map((item) => (item.id === message.id ? message : item));
    });
  };

  // Subscribe to the channel event stream for live message updates.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || typeof window === "undefined") {
      return;
    }

    const eventSource = new EventSource(
      `/api/servers/${serverId}/channels/${channelId}/stream`
    );

    const handleOpen = () => {
      setIsStreamConnected(true);
    };

    const handleError = () => {
      setIsStreamConnected(false);
      eventSource.close();
    };

    const handleMessageCreated = (event: MessageEvent<string>) => {
      const message = JSON.parse(event.data) as ChannelMessage;
      upsertMessage(message);
    };

    eventSource.addEventListener("open", handleOpen);
    eventSource.addEventListener("error", handleError);
    eventSource.addEventListener("message.created", handleMessageCreated);

    return () => {
      eventSource.removeEventListener("open", handleOpen);
      eventSource.removeEventListener("error", handleError);
      eventSource.removeEventListener("message.created", handleMessageCreated);
      eventSource.close();
      setIsStreamConnected(false);
    };
  }, [isLoaded, isSignedIn, serverId, channelId]);

  // Poll when the live stream is unavailable so messages still appear without refresh.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || isStreamConnected) {
      return;
    }

    const intervalId = setInterval(() => {
      void loadMessages();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isLoaded, isSignedIn, isStreamConnected, serverId, channelId]);

  if (!Array.isArray(messages)) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} setReplyingTo={setReplyingTo} />
      </div>

      <MessageInput
        serverId={serverId}
        channelId={channelId}
        channelName={channelName}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        onMessageCreated={upsertMessage}
      />
    </div>
  );
}
