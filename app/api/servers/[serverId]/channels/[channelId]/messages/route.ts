import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ serverId: string; channelId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { serverId, channelId } = await params;
    const body = await req.json();
    const content =
      typeof body.content === "string" ? body.content.trim() : "";
    const fileUrl = typeof body.fileUrl === "string" ? body.fileUrl : null;
    const replyToId =
      typeof body.replyToId === "string" ? body.replyToId : null;

    if (!content && !fileUrl)
      return new NextResponse("Missing message content", { status: 400 });

    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) return new NextResponse("Profile not found", { status: 404 });

    const member = await db.member.findFirst({
      where: { profileId: profile.id, serverId },
    });
    if (!member) return new NextResponse("Not a server member", { status: 403 });

    const channel = await db.channel.findFirst({
      where: {
        id: channelId,
        serverId,
      },
      select: {
        id: true,
      },
    });
    if (!channel) return new NextResponse("Channel not found", { status: 404 });

    if (replyToId) {
      const replyTarget = await db.message.findFirst({
        where: {
          id: replyToId,
          channelId: channel.id,
        },
        select: {
          id: true,
        },
      });

      if (!replyTarget) {
        return new NextResponse("Reply target not found", { status: 400 });
      }
    }

    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        replyToId: replyToId || null, 
        memberId: member.id,
        channelId: channel.id,
      },
      include: {
        member: { include: { profile: true } },
        replyTo: { include: { member: { include: { profile: true } } } }, 
      },
    });

    return NextResponse.json(message);
  } catch (err) {
    console.error("[MESSAGE_POST]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ serverId: string; channelId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { serverId, channelId } = await params;

    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) return new NextResponse("Profile not found", { status: 404 });

    const member = await db.member.findFirst({
      where: { profileId: profile.id, serverId },
    });
    if (!member) return new NextResponse("Not a server member", { status: 403 });

    const channel = await db.channel.findFirst({
      where: {
        id: channelId,
        serverId,
      },
      select: {
        id: true,
      },
    });
    if (!channel) return new NextResponse("Channel not found", { status: 404 });

    const messages = await db.message.findMany({
      where: { channelId: channel.id },
      include: {
        member: { include: { profile: true } },
        replyTo: {
          include: {
            member: {
              include: {
                profile: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (err) {
    console.error("[MESSAGE_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
