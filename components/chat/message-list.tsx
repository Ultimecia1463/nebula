import { Message } from "@prisma/client";
import React from "react";

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col-reverse p-4 space-y-3-reverse overflow-y-auto h-full">
      {messages.map((msg) => (
        <div key={msg.id} className="flex flex-row gap-3 mb-2">
          <span className="text-sm font-semibold text-indigo-400">
            {msg.member.profile.name}
          </span>
          <span className="text-sm text-white">{msg.content}</span>
        </div>
      ))}
    </div>
  );
}
