import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FoodCard } from "./FoodCard";
import type { FoodItem, AppPhase } from "../types/food";

interface ShuffleZoneProps {
  phase: AppPhase;
  currentFood: FoodItem | null;
  ghostFoods: FoodItem[];
  recentLabel?: string;
  geo?: { getPosition: () => Promise<{ lat: number; lng: number } | null>; denied?: boolean };
}

const ghostVariant = {
  initial: { x: -200, opacity: 0, scale: 0.9 },
  animate: { x: 0, opacity: 0.6, scale: 1 },
  exit: { x: 200, opacity: 0, scale: 0.9 },
};

const enterVariant = {
  initial: { x: -300, opacity: 0, scale: 0.85 },
  animate: { x: 0, opacity: 1, scale: 1 },
};

function IdlePrompt() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      animate={reduce ? undefined : { y: [0, -8, 0] }}
      transition={reduce ? undefined : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
      className="w-full rounded-2xl flex flex-col items-center justify-center py-16 gap-3"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <span className="text-5xl">🎲</span>
      <p className="text-white/60 text-sm">เลือก filter แล้วกด สุ่ม!</p>
    </motion.div>
  );
}

export function ShuffleZone({ phase, currentFood, ghostFoods, recentLabel, geo }: ShuffleZoneProps) {
  const [ghostIndex, setGhostIndex] = useState(-1);

  useEffect(() => {
    if (phase !== "spinning") return;
    const t0 = setTimeout(() => setGhostIndex(0), 0);
    const t1 = setTimeout(() => setGhostIndex(1), 200);
    const t2 = setTimeout(() => setGhostIndex(2), 400);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      setGhostIndex(-1);
    };
  }, [phase]);

  async function handleFindNearby() {
    if (!currentFood) return;
    const pos = geo ? await geo.getPosition() : null;
    const query = encodeURIComponent(currentFood.nameTH);
    const url = pos
      ? `https://www.google.com/maps/search/${query}/@${pos.lat},${pos.lng},15z`
      : `https://www.google.com/maps/search/${query}`;
    window.open(url, "_blank");
  }

  return (
    <div className="relative px-4 min-h-[320px] flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-sm" role="status" aria-live="polite">
        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ x: 300, opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            >
              <IdlePrompt />
            </motion.div>
          )}

          {phase === "spinning" && ghostIndex >= 0 && ghostIndex < ghostFoods.length && (
            <motion.div
              key={`ghost-${ghostIndex}`}
              variants={ghostVariant}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.15 }}
            >
              <FoodCard food={ghostFoods[ghostIndex]} ghost />
            </motion.div>
          )}

          {phase === "result" && currentFood && (
            <motion.div
              key={`winner-${currentFood.id}`}
              variants={enterVariant}
              initial="initial"
              animate="animate"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <FoodCard
                food={currentFood}
                recentLabel={recentLabel}
                onFindNearby={handleFindNearby}
                geoDenied={geo?.denied}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
