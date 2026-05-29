import { useState, useRef } from "react";

export function useGeolocation() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);
  const lastFetch = useRef(0);

  async function getPosition(): Promise<{ lat: number; lng: number } | null> {
    if (position && Date.now() - lastFetch.current < 600000) {
      return position;
    }
    if (!("geolocation" in navigator)) {
      return null;
    }

    if ("permissions" in navigator) {
      try {
        const status = await navigator.permissions.query({ name: "geolocation" });
        if (status.state === "denied") {
          setDenied(true);
          return null;
        }
      } catch {
        /* Permissions API unsupported in this browser — fall through and prompt directly */
      }
    }

    setLoading(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(p);
          lastFetch.current = Date.now();
          setLoading(false);
          setDenied(false);
          resolve(p);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) setDenied(true);
          setLoading(false);
          resolve(null);
        },
        { timeout: 5000 }
      );
    });
  }

  return { getPosition, position, loading, denied };
}
