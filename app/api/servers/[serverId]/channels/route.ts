import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";

export async function POST(
  req: Request,
  context: { params: Promise<{ serverId: string }> } 
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { name, type } = await req.json();
    if (!name || !type)
      return new NextResponse("Missing required fields", { status: 400 });

    const { serverId } = await context.params;

    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile)
      return new NextResponse("Profile not found", { status: 404 });

    const server = await db.server.findUnique({
      where: { id: serverId },
      include: { members: true },
    });

    if (!server)
      return new NextResponse("Server not found", { status: 404 });

    const member = server.members.find((m) => m.profileId === profile.id);
    if (!member || (member.role !== "ADMIN" && member.role !== "MODERATOR")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const channel = await db.channel.create({
      data: {
        name,
        type: type as ChannelType,
        profileId: profile.id,
        serverId: server.id,
      },
    });

    return NextResponse.json(channel);
  } catch (err) {
    console.error("[CHANNEL_POST]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
