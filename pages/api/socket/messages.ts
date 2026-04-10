import { NextApiRequest } from "next";
import { ensureSocketServer } from "@/lib/socket-server";
import { NextApiResponseServerIO } from "../../../types/socket";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const io = ensureSocketServer(res.socket.server);
    const { message, channelKey, roomKey } = req.body as {
      message: unknown;
      channelKey: string;
      roomKey?: string;
    };

    if (!channelKey) {
      return res.status(400).json({ error: "Missing channel key" });
    }

    if (roomKey) {
      io.to(roomKey).emit(channelKey, message);
    } else {
      io.emit(channelKey, message);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("[SOCKET_MESSAGES_POST]", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
