import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "../../../types/socket";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, channelKey } = req.body;

    // Emit the message to all clients in the channel
    res?.socket?.server?.io?.emit(channelKey, message);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("[SOCKET_MESSAGES_POST]", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
