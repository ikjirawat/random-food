import { useState, useRef } from "react";

export function useGeolocation() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const lastFetch = useRef(0);

  function getPosition(): Promise<{ lat: number; lng: number } | null> {
    if (position && Date.now() - lastFetch.current < 600000) {
      return Promise.resolve(position);
    }
    setLoading(true);
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        setLoading(false);
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(p);
          lastFetch.current = Date.now();
          setLoading(false);
          resolve(p);
        },
        () => {
          setLoading(false);
          resolve(null);
        },
        { timeout: 5000 }
      );
    });
  }

  return { getPosition, position, loading };
}
