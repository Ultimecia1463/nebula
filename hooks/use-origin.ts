import { useMounted } from "@/hooks/use-mounted";

const useOrigin = () => {
  const mounted = useMounted();

  const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";

  if (!mounted) {
    return "";
  }
  return origin;
};

export default useOrigin;
