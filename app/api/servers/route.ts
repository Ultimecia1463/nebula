import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { name, imageUrl } = body;

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

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const server = await db.server.create({
      data: {
        name,
        imageUrl,
        inviteCode,
        members: {
          create: [
            {
              profileId: profile.id, // ✅ FIXED
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
