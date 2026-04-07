"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type LegacySocketLike = {
  on: (...args: unknown[]) => void;
  off: (...args: unknown[]) => void;
  emit: (...args: unknown[]) => void;
};

type SocketContextType = {
  socket: LegacySocketLike | null;
  isConnected: boolean;
  transport: "none" | "sse" | "polling";
  setRealtimeState: (state: {
    isConnected: boolean;
    transport: "none" | "sse" | "polling";
  }) => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  transport: "none",
  setRealtimeState: () => {},
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState<"none" | "sse" | "polling">("none");

  const setRealtimeState = useCallback(
    ({
      isConnected,
      transport,
    }: {
      isConnected: boolean;
      transport: "none" | "sse" | "polling";
    }) => {
      setIsConnected(isConnected);
      setTransport(transport);
    },
    []
  );

  const value = useMemo(
    () => ({
      socket: null,
      isConnected,
      transport,
      setRealtimeState,
    }),
    [isConnected, transport, setRealtimeState]
  );

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
