import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";
import { normalizeChannelType } from "@/lib/channel-type";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { channelId } = await params;
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const type = typeof body.type === "string" ? body.type : "";

    if (!name || !type)
      return new NextResponse("Missing required fields", { status: 400 });

    const channel = await db.channel.findUnique({
      where: { id: channelId },
      include: { server: { include: { members: true } } },
    });

    if (!channel) return new NextResponse("Channel not found", { status: 404 });

    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) return new NextResponse("Profile not found", { status: 404 });

    const member = channel.server.members.find(
      (m) => m.profileId === profile.id
    );

    if (!member || (member.role !== "ADMIN" && member.role !== "MODERATOR"))
      return new NextResponse("Forbidden", { status: 403 });

    const normalizedType = normalizeChannelType(type as ChannelType);

    const updatedChannel = await db.channel.update({
      where: { id: channelId },
      data: { name, type: normalizedType },
    });

    return NextResponse.json(updatedChannel);
  } catch (error) {
    console.error("[CHANNEL_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { channelId } = await params;

    const channel = await db.channel.findUnique({
      where: { id: channelId },
      include: {
        server: { include: { members: true } },
      },
    });

    if (!channel)
      return new NextResponse("Channel not found", { status: 404 });

    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile)
      return new NextResponse("Profile not found", { status: 404 });

    const member = channel.server.members.find(
      (m) => m.profileId === profile.id
    );

    if (!member || (member.role !== "ADMIN" && member.role !== "MODERATOR")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await db.channel.delete({ where: { id: channelId } });
    return new NextResponse("Deleted Successfully", { status: 200 });
  } catch (error) {
    console.error("[CHANNEL_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
