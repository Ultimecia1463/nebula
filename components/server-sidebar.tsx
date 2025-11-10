import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

const ServerSidebar = async () => {
  const { userId } = await auth();
  if (!userId) return null;

  const profile = await db.profile.findUnique({
    where: { userId },
  });
  if (!profile) return null;

  const servers = await db.server.findMany({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  });

  if (servers.length === 0) {
    console.log("No servers found for profile:", profile.id);
  } else {
    console.log("Servers found:", servers);
  }

  return (
    <TooltipProvider>
      <div className="fixed left-0 top-0 h-full w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 space-y-3">
        {servers.length > 0 ? (
          servers.map((server) => (
            <Tooltip key={server.id}>
              <TooltipTrigger asChild>
                <Link
                  href={`/servers/${server.id}`}
                  className="group relative flex items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-700 group-hover:rounded-xl transition-all duration-200">
                    <Image
                      src={server.imageUrl || "/placeholder.png"}
                      alt={server.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{server.name}</p>
              </TooltipContent>
            </Tooltip>
          ))
        ) : (
          <div className="text-xs text-zinc-400 mt-4">No servers yet</div>
        )}

        {/* Add Server Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/setup"
              className="mt-auto mb-3 w-12 h-12 flex items-center justify-center rounded-full bg-zinc-700 text-zinc-300 hover:bg-green-600 hover:text-white transition"
            >
              +
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Create or Join a Server</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ServerSidebar;
