import qs from "querystring";
import { useParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";

interface ChatQueryProps {
  queryKey: string;
  apiUrl: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
}

export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
}: ChatQueryProps) => {
  const { isConnected } = useSocket();
  const params = useParams();

  const fetchMessages = async ({ pageParam }: { pageParam?: string }) => {
    const queryParams = new URLSearchParams();
    if (pageParam) {
      queryParams.append("cursor", pageParam);
    }
    queryParams.append(paramKey, paramValue);

    const url = `${apiUrl}?${queryParams.toString()}`;

    const res = await fetch(url);
    const data = await res.json();

    return data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status} = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    initialPageParam: undefined,
    refetchInterval: isConnected ? false : 1000,
    // Optimize caching strategy
    staleTime: 1000 * 60, // Data is fresh for 1 minute
    gcTime: 1000 * 60 * 5, // Keep unused data in cache for 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: isConnected, // Only refetch on reconnect if not connected via socket
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return { data, fetchNextPage, hasNextPage, isFetchingNextPage, status };
};
