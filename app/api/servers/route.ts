import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createUniqueInviteCode } from "@/lib/invite-code";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : "";

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name || !imageUrl) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const profile = await db.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    const inviteCode = await createUniqueInviteCode();

    const server = await db.server.create({
      data: {
        name,
        imageUrl,
        inviteCode,
        profileId: profile.id,
        channels: {
          create: [
            {
              name: "general",
              profileId: profile.id,
            },
          ],
        },
        members: {
          create: [
            {
              profileId: profile.id,
              role: "ADMIN",
            },
          ],
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[SERVER_POST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
