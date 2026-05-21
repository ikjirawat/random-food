import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SwipeCard } from "./SwipeCard";
import type { FoodItem } from "../types/food";

interface SwipeModeProps {
  foods: FoodItem[];
  onAccept: (food: FoodItem) => void;
  onExhausted: () => void;
  recentLabel: (food: FoodItem) => string | undefined;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SwipeMode({ foods, onAccept, onExhausted, recentLabel }: SwipeModeProps) {
  const shuffled = useMemo(() => shuffle(foods), [foods]);
  const [index, setIndex] = useState(0);

  const current = shuffled[index];
  const next = shuffled[index + 1];
  const remaining = shuffled.length - index;

  function handleReject() {
    if (index + 1 >= shuffled.length) {
      onExhausted();
    } else {
      setIndex((i) => i + 1);
    }
  }

  function handleAccept() {
    if (current) onAccept(current);
  }

  if (!current) {
    return (
      <div className="px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <span className="text-5xl block mb-4">😅</span>
          <p className="text-white/70 text-base font-medium mb-2">เลือกไม่ได้เลยเหรอ</p>
          <p className="text-white/40 text-sm mb-4">สุ่มให้ละกัน!</p>
          <button
            onClick={onExhausted}
            className="px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer"
            style={{ background: "var(--orange)", color: "#fff", border: "none" }}
          >
            🎲 สุ่มให้เลย
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 min-h-[380px] flex flex-col items-center gap-4">
      <p className="text-white/40 text-xs font-mono">เหลือ {remaining} อย่าง</p>
      <div className="relative w-full max-w-sm">
        {next && (
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{
              transform: "scale(0.95) translateY(8px)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              opacity: 0.5,
              zIndex: 0,
            }}
          >
            <div className="aspect-[16/10] flex items-center justify-center" style={{ background: "var(--orange-bg)" }}>
              <span className="text-4xl">{next.emoji}</span>
            </div>
            <div className="px-5 py-3">
              <p className="text-base font-bold text-white/60">{next.nameTH}</p>
            </div>
          </div>
        )}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <SwipeCard
              key={current.id}
              food={current}
              onSwipeLeft={handleReject}
              onSwipeRight={handleAccept}
              recentLabel={recentLabel(current)}
            />
          </AnimatePresence>
        </div>
      </div>
      <div className="flex gap-6 mt-2">
        <button
          onClick={handleReject}
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg cursor-pointer"
          style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.25)" }}
          aria-label="ไม่เอา"
        >
          ✕
        </button>
        <button
          onClick={handleAccept}
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg cursor-pointer"
          style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.25)" }}
          aria-label="เอา"
        >
          ♥
        </button>
      </div>
    </div>
  );
}
