import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const profile = await db.profile.findUnique({
      where: { userId },
    });

    if (!profile)
      return new NextResponse("Profile not found", { status: 404 });

    const server = await db.server.findUnique({
      where: { id: params.serverId },
      include: { members: true },
    });

    if (!server)
      return new NextResponse("Server not found", { status: 404 });

    const member = server.members.find(
      (m) => m.profileId === profile.id
    );

    if (!member || member.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const updatedServer = await db.server.update({
      where: { id: server.id },
      data: { inviteCode: newCode },
    });

    return NextResponse.json(updatedServer);
  } catch (err) {
    console.error("[INVITE_PATCH]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
