import { useMounted } from "@/hooks/use-mounted";

const useOrigin = () => {
  const mounted = useMounted();

  if (!mounted || typeof window === "undefined") {
    return "";
  }

  return window.location.origin;
};

export default useOrigin;
