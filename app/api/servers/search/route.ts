import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    const servers = await db.server.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: 10,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        inviteCode: true,
      },
    });

    return NextResponse.json(servers);
  } catch (error) {
    console.error("[SERVER_SEARCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
