import { useEffect, useState } from "react";

/**
 * Senior Tip: Use this hook to prevent hydration issues
 * when rendering components that depend on client-side state
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
