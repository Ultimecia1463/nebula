import { NextApiRequest } from "next";
import { ensureSocketServer } from "@/lib/socket-server";
import { NextApiResponseServerIO } from "../../../types/socket";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  ensureSocketServer(res.socket.server);

  return res.status(200).json({ ok: true });
}
