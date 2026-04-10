import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";

export const initialProfile = async () => {
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const profile = await db.profile.findUnique({
    where: {
        userId: user.id
    }
  });

  if (profile) {
    return profile;
  }

  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    user.emailAddresses[0]?.emailAddress.split("@")[0] ||
    "Nebula User";

  const newProfile = await db.profile.create({
    data: {
        userId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress
    }
  });

  return newProfile;
}

