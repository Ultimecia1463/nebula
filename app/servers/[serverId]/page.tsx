import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ServerPageProps {
  params: Promise<{ serverId: string }>;
}

const ServerPage = async ({ params }: ServerPageProps) => {
  const { userId } = await auth();
  if (!userId) return redirect("/sign-in");

  const { serverId } = await params;

  const server = await db.server.findUnique({
    where: { id: serverId },
    include: {
      members: { include: { profile: true } },
      channels: true,
    },
  });

  if (!server) return redirect("/setup");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{server.name}</h1>
      <p className="text-zinc-500 mt-2">Server ID: {server.id}</p>

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Members:</h2>
        <ul className="list-disc pl-5 space-y-1">
          {server.members.map((m) => (
            <li key={m.id}>
              {m.profile.name} ({m.role})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ServerPage;
