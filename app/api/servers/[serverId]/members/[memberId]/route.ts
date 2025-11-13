import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ serverId: string; memberId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { serverId, memberId } = await params; 
    const body = await req.json();
    const { role } = body as { role: MemberRole };
    if (!role) return new NextResponse("Role missing", { status: 400 });

    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) return new NextResponse("Profile not found", { status: 404 });

    const admin = await db.member.findFirst({
      where: { serverId, profileId: profile.id },
    });
    if (!admin || admin.role !== "ADMIN")
      return new NextResponse("Forbidden", { status: 403 });

    const updated = await db.member.update({
      where: { id: memberId },
      data: { role },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[MEMBER_ROLE_PATCH]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ serverId: string; memberId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { serverId, memberId } = await params; 

    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) return new NextResponse("Profile not found", { status: 404 });

    const admin = await db.member.findFirst({
      where: { serverId, profileId: profile.id },
    });
    if (!admin || admin.role !== "ADMIN")
      return new NextResponse("Forbidden", { status: 403 });

    const member = await db.member.findUnique({
      where: { id: memberId },
    });
    if (!member) return new NextResponse("Member not found", { status: 404 });

    // Prevent kicking yourself
    if (member.profileId === profile.id)
      return new NextResponse("Cannot remove yourself", { status: 400 });

    await db.member.delete({ where: { id: memberId } });
    return new NextResponse("Removed", { status: 200 });
  } catch (err) {
    console.error("[MEMBER_DELETE]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
