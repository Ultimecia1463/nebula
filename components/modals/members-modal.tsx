"use client";

import axios from "axios";
import { useModal } from "@/hooks/use-modal-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState } from "react";
import { MemberRole } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs"; 

export const MembersModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "members";
  const { server } = data;
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { userId } = useAuth(); 

  if (!server) return null;

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoading(true);
      await axios.patch(`/api/servers/${server.id}/members/${memberId}`, { role });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onKick = async (memberId: string) => {
    try {
      setLoading(true);
      await axios.delete(`/api/servers/${server.id}/members/${memberId}`);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Server Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {server.members.map((m: any) => {
            const isSelf = m.profile.userId === userId; 
            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={m.profile.imageUrl}
                    width={36}
                    height={36}
                    alt={m.profile.name}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{m.profile.name}</p>
                    <p className="text-xs text-gray-500">{m.profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    defaultValue={m.role}
                    onValueChange={(val) => onRoleChange(m.id, val as MemberRole)}
                    disabled={loading || isSelf} 
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder={m.role} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MODERATOR">Moderator</SelectItem>
                      <SelectItem value="GUEST">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onKick(m.id)}
                    disabled={loading || isSelf} 
                  >
                    Kick
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
