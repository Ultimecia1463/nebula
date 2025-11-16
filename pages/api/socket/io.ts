import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIO } from "../../../types/socket";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("✅ Client connected:", socket.id);

      // Join a channel room
      socket.on("join-channel", ({ channelId }: { channelId: string }) => {
        socket.join(channelId);
        console.log(`📥 Socket ${socket.id} joined channel ${channelId}`);
      });

      // Leave a channel room
      socket.on("leave-channel", ({ channelId }: { channelId: string }) => {
        socket.leave(channelId);
        console.log(`📤 Socket ${socket.id} left channel ${channelId}`);
      });

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });
  }

  res.end();
};

export default ioHandler;
