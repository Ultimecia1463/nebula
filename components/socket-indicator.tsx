"use client";

import { Badge } from "./ui/badge";

export const SocketIndicator = () => {
  return (
    <Badge variant="outline" className="border-none bg-amber-600 text-white">
      Auto-refresh: 3s
    </Badge>
  );
};
