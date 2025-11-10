import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface InvitePageProps {
  params: Promise<{ inviteCode: string }>;
}

const InvitePage = async ({ params }: InvitePageProps) => {
  const { userId } = await auth();
  if (!userId) return redirect("/sign-in");

  // ✅ await the params promise first
  const { inviteCode } = await params;

  const profile = await db.profile.findUnique({
    where: { userId },
  });

  if (!profile) return redirect("/setup");

  const server = await db.server.findFirst({
    where: { inviteCode },
    include: { members: true },
  });

  if (!server) return redirect("/");

  const isMember = server.members.some(
    (member) => member.profileId === profile.id
  );

  if (isMember) return redirect(`/servers/${server.id}`);

  await db.member.create({
    data: {
      profileId: profile.id,
      serverId: server.id,
      role: "GUEST",
    },
  });

  return redirect(`/servers/${server.id}`);
};

export default InvitePage;
