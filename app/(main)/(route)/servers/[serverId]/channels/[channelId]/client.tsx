"use client";

import { useCallback, useEffect, useState } from "react";

import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import type { ChannelMessage } from "@/types";

interface ChannelPageClientProps {
  serverId: string;
  channelId: string;
  channelName: string;
}

export default function ChannelPageClient({
  serverId,
  channelId,
  channelName,
}: ChannelPageClientProps) {
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [replyingTo, setReplyingTo] = useState<ChannelMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await fetch(
          `/api/servers/${serverId}/channels/${channelId}/messages`,
          {
            cache: "no-store",
            signal,
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load channel messages.");
        }

        const data = (await response.json()) as ChannelMessage[];
        setMessages(Array.isArray(data) ? data : []);
        setError(null);
      } catch (loadError) {
        if (signal?.aborted) {
          return;
        }

        console.error("Failed to load messages:", loadError);
        setMessages([]);
        setError("Unable to load channel messages right now.");
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [channelId, serverId]
  );

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setReplyingTo(null);
    void loadMessages(controller.signal);

    const intervalId = window.setInterval(() => {
      void loadMessages();
    }, 3000);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [loadMessages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {error ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-zinc-400">
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-zinc-400">
            Loading messages...
          </div>
        ) : (
          <MessageList messages={messages} setReplyingTo={setReplyingTo} />
        )}
      </div>

      <MessageInput
        serverId={serverId}
        channelId={channelId}
        channelName={channelName}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        onMessageSent={() => loadMessages()}
      />
    </div>
  );
}
