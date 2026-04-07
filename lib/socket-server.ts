import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";
import { setSocketServer } from "@/lib/get-socket";

type ServerWithIO = {
  io?: ServerIO;
};

const getChannelId = (payload: string | { channelId: string }) =>
  typeof payload === "string" ? payload : payload.channelId;

export const ensureSocketServer = (server: ServerWithIO) => {
  if (server.io) {
    return server.io;
  }

  const io = new ServerIO(server as NetServer, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
  });

  server.io = io;
  setSocketServer(io);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-channel", (payload: string | { channelId: string }) => {
      const channelId = getChannelId(payload);
      socket.join(channelId);
      console.log(`Socket ${socket.id} joined channel ${channelId}`);
    });

    socket.on("leave-channel", (payload: string | { channelId: string }) => {
      const channelId = getChannelId(payload);
      socket.leave(channelId);
      console.log(`Socket ${socket.id} left channel ${channelId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};
