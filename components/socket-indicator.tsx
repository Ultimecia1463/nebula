"use client";

import { useSocket } from "./providers/socket-provider";
import { Badge } from "./ui/badge";

export const SocketIndicator = () => {
  const { isConnected, transport } = useSocket();

  if (isConnected && transport === "sse") {
    return (
      <Badge variant="outline" className="bg-emerald-600 text-white border-none">
        Live: Event Stream
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-yellow-600 text-white border-none">
      Fallback: Polling every 1s
    </Badge>
  );
};
