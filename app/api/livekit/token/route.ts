import { ChannelType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AccessToken } from "livekit-server-sdk";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { normalizeChannelType } from "@/lib/channel-type";
import { getLiveKitConfig, getLiveKitRoomName } from "@/lib/livekit";
import type {
  LiveKitConnectionDetails,
  LiveKitParticipantMetadata,
} from "@/types/livekit";

export const runtime = "nodejs";

const requestSchema = z.object({
  channelId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { channelId } = requestSchema.parse(body);

    const channel = await db.channel.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    if (channel.type === ChannelType.TEXT) {
      return new NextResponse("Live media is only available for video channels", {
        status: 400,
      });
    }

    const normalizedChannelType =
      normalizeChannelType(channel.type) as LiveKitConnectionDetails["channelType"];

    const member = await db.member.findFirst({
      where: {
        profileId: profile.id,
        serverId: channel.serverId,
      },
      include: {
        profile: true,
      },
    });

    if (!member) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { apiKey, apiSecret, serverUrl } = getLiveKitConfig();
    const roomName = getLiveKitRoomName(channel.id);

    const participantMetadata: LiveKitParticipantMetadata = {
      memberId: member.id,
      profileId: member.profileId,
      imageUrl: member.profile.imageUrl ?? null,
      channelId: channel.id,
      channelType: normalizedChannelType,
    };

    const token = new AccessToken(apiKey, apiSecret, {
      identity: member.id,
      name: member.profile.name,
      metadata: JSON.stringify(participantMetadata),
      ttl: "2h",
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const connectionDetails: LiveKitConnectionDetails = {
      token: await token.toJwt(),
      serverUrl,
      roomName,
      channelId: channel.id,
      channelType: normalizedChannelType,
    };

    return NextResponse.json(connectionDetails);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid live room request", details: error.flatten() },
        { status: 400 }
      );
    }

    console.error("[LIVEKIT_TOKEN_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
