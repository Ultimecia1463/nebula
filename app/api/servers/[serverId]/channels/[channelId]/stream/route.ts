import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscribeToChannelEvents } from "@/lib/channel-events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const encoder = new TextEncoder();

const toSseMessage = (event: string, data: unknown) =>
  encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ serverId: string; channelId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { serverId, channelId } = await params;

    const profile = await db.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    const member = await db.member.findFirst({
      where: { profileId: profile.id, serverId },
    });

    if (!member) {
      return new NextResponse("Not a server member", { status: 403 });
    }

    let cleanup = () => {};

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          toSseMessage("ready", {
            channelId,
          })
        );

        const heartbeatId = setInterval(() => {
          controller.enqueue(
            toSseMessage("ping", {
              ts: Date.now(),
            })
          );
        }, 25000);

        const unsubscribe = subscribeToChannelEvents(channelId, (event) => {
          controller.enqueue(toSseMessage(event.type, event.payload));
        });

        cleanup = () => {
          clearInterval(heartbeatId);
          unsubscribe();

          try {
            controller.close();
          } catch {
            // Ignore close errors after the stream is already closed.
          }
        };

        req.signal.addEventListener("abort", cleanup, { once: true });
      },
      cancel() {
        cleanup();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[CHANNEL_STREAM_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
