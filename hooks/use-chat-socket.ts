import { useEffect } from "react";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

type SocketMessage = {
  id: string;
} & Record<string, unknown>;

type ChatPage = {
  items: SocketMessage[];
  nextCursor?: string | null;
};

type ChatInfiniteData = InfiniteData<ChatPage, string | undefined>;

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (message: SocketMessage) => {
      queryClient.setQueryData<ChatInfiniteData>([queryKey], (oldData) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const pages = oldData.pages.map((page) => ({
          ...page,
          items: page.items.map((item) =>
            item.id === message.id ? message : item
          ),
        }));

        return {
          ...oldData,
          pages,
        };
      });
    };

    const handleAdd = (message: SocketMessage) => {
      queryClient.setQueryData<ChatInfiniteData>([queryKey], (oldData) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                items: [message],
              },
            ],
            pageParams: [undefined],
          };
        }

        const pages = [...oldData.pages];

        pages[0] = {
          ...pages[0],
          items: [message, ...pages[0].items],
        };

        return {
          ...oldData,
          pages,
        };
      });
    };

    socket.on(updateKey, handleUpdate);
    socket.on(addKey, handleAdd);

    return () => {
      socket.off(addKey, handleAdd);
      socket.off(updateKey, handleUpdate);
    };
  }, [queryClient, addKey, queryKey, socket, updateKey]);
};
