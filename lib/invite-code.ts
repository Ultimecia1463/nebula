import { randomBytes } from "node:crypto";

import { db } from "@/lib/db";

const INVITE_CODE_LENGTH = 8;
const MAX_ATTEMPTS = 10;

const generateInviteCode = () =>
  randomBytes(6)
    .toString("base64url")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, INVITE_CODE_LENGTH)
    .toUpperCase();

export const createUniqueInviteCode = async () => {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const inviteCode = generateInviteCode();
    const existingServer = await db.server.findUnique({
      where: {
        inviteCode,
      },
      select: {
        id: true,
      },
    });

    if (!existingServer) {
      return inviteCode;
    }
  }

  throw new Error("Unable to generate a unique invite code.");
};
