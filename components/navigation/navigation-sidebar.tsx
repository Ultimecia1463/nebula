import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import NavigationAction from "./navigation-action";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import NavigationItem from "./navigation-item";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "../mode-toggle";
import { currentProfile } from "@/lib/current-profile";

const NavigationSidebar = async () => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const servers = await db.server.findMany({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  // Server check
  console.log(`List of Servers: ${servers}`);
  return (
    <div className="flex flex-col space-y-4 items-center h-full text-primary w-full dark:bg-[#1E1F22] py-3">
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {servers.map((server) => (
          <div key={server.id}>
            <NavigationItem
              id={server.id}
              name={server.name}
              imageUrl={server.imageUrl}
            />
          </div>
        ))}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
        <UserButton
            appearance={{
                elements: {
                    avatarBox: "h-[72px] w-[72px]"
                }
            }}
        />
      </div>
    </div>
  );
};

export default NavigationSidebar;
