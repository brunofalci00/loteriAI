import { useEffect, useRef, useState } from "react";

export function useExitIntent(enabled: boolean) {
  const [triggered, setTriggered] = useState(false);
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseOut = (event: MouseEvent) => {
      if (event.relatedTarget || event.clientY > 0) return;
      if (hasShownRef.current) return;
      setTriggered(true);
    };

    const handleBlur = () => {
      if (document.visibilityState === "hidden" || hasShownRef.current) return;
      setTriggered(true);
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [enabled]);

  const acknowledge = () => {
    hasShownRef.current = true;
    setTriggered(false);
  };

  return { exitIntentTriggered: enabled && triggered && !hasShownRef.current, acknowledge };
}
