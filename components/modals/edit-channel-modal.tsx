"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash } from "lucide-react";

export const EditChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "editChannel";
  const { channel, server } = data;

  const [name, setName] = useState(channel?.name || "");
  const [channelType, setChannelType] = useState(channel?.type || "TEXT");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false); // 🔥 new: confirmation dialog

  const router = useRouter();

  const onSubmit = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/channels/${channel.id}`, {
        name,
        type: channelType,
      });
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/channels/${channel.id}`);
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  if (!channel || !server) return null;

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={onClose}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center font-bold">
              Edit Channel
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <Input
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Channel name"
              className="border-gray-400"
            />

            <Select
              defaultValue={channelType}
              onValueChange={(val) => setChannelType(val)}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEXT">Text</SelectItem>
                <SelectItem value="AUDIO">Audio</SelectItem>
              </SelectContent>
            </Select>

            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                disabled={loading || !name}
                onClick={onSubmit}
                className="w-full sm:w-auto"
              >
                Save Changes
              </Button>

              <Button
                disabled={loading}
                variant="destructive"
                onClick={() => setConfirmOpen(true)} // opens confirmation popup
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <Trash className="w-4 h-4" />
                Delete Channel
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-white text-black max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Channel Deletion
            </DialogTitle>
          </DialogHeader>

          <p className="text-gray-600">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-black">#{channel?.name}</span>?
            <br />
            This action <strong>cannot be undone.</strong>
          </p>

          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={onDelete}
              className="flex items-center gap-2"
            >
              <Trash className="w-4 h-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
