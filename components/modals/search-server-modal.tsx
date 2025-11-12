"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useModal } from "@/hooks/use-modal-store";
import { useRouter } from "next/navigation";

export const SearchServerModal = () => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "searchServer";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        const res = await axios.get(`/api/servers/search?q=${query}`);
        setResults(res.data);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const joinServer = async (inviteCode: string) => {
    await router.push(`/invite/${inviteCode}`);
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-6 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Search Servers
          </DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search by server name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-4"
        />

        <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto">
          {loading && <p className="text-center text-gray-500">Searching...</p>}
          {!loading && results.length === 0 && query && (
            <p className="text-center text-gray-400">No servers found.</p>
          )}
          {results.map((server) => (
            <div
              key={server.id}
              className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={server.imageUrl}
                  width={40}
                  height={40}
                  alt={server.name}
                  className="rounded-full"
                />
                <p className="font-semibold">{server.name}</p>
              </div>
              <Button
                size="sm"
                onClick={() => joinServer(server.inviteCode)}
              >
                Join
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
