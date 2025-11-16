import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { User } from "lucide-react";
import React from "react";

interface UserAvatarProps {
  src?: string;
  className?: string;
  alt?: string;
}

export const UserAvatar = React.memo(({ src, className, alt = "User avatar" }: UserAvatarProps) => {
  return (
    <Avatar className={cn("h-7 w-7 rounded-full" , className)}>
      <AvatarImage 
        src={src} 
        alt={alt}
        className="h-7 w-7 rounded-full object-cover"
        loading="lazy"
      />
      <AvatarFallback className="h-7 w-7 rounded-full bg-zinc-500 flex items-center justify-center">
        <User className="h-4 w-4 text-white" />
      </AvatarFallback>
    </Avatar>
  );
});
