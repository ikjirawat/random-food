import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FoodItem, Venue } from "../types/food";

const VENUE_LABELS: Record<Venue, { emoji: string; label: string }> = {
  "7-11": { emoji: "🏪", label: "7-11" },
  street: { emoji: "🛒", label: "ริมทาง" },
  restaurant: { emoji: "🍽", label: "ร้านอาหาร" },
  home: { emoji: "🏠", label: "ทำเอง" },
};

function FoodImage({ food }: { food: FoodItem }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl" style={{ background: "var(--bg-card)" }}>
      <AnimatePresence>
        {(!loaded || error) && (
          <motion.div
            key="emoji"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "var(--orange-bg)" }}
          >
            <span className="text-6xl">{food.emoji}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {!error && (
        <motion.img
          src={food.image}
          alt={food.nameTH}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}

interface FoodCardProps {
  food: FoodItem;
  ghost?: boolean;
  recentLabel?: string;
  onFindNearby?: () => void;
  geoDenied?: boolean;
}

export function FoodCard({ food, ghost, recentLabel, onFindNearby, geoDenied }: FoodCardProps) {
  if (ghost) {
    return (
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          filter: "blur(4px)",
          opacity: 0.6,
        }}
      >
        <div className="aspect-[16/10] flex items-center justify-center" style={{ background: "var(--orange-bg)" }}>
          <span className="text-5xl">{food.emoji}</span>
        </div>
        <div className="px-5 py-4">
          <p className="text-lg font-bold text-white/80">{food.nameTH}</p>
        </div>
      </div>
    );
  }

  const showFindNearby = onFindNearby && food.availableAt.some((v) => v === "street" || v === "restaurant");

  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <FoodImage food={food} />
      <div className="px-5 py-4 flex flex-col gap-2.5">
        <div>
          {recentLabel && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full mb-1 inline-block"
              style={{ background: "rgba(251, 191, 36, 0.15)", color: "#FBBF24" }}
            >
              {recentLabel}
            </span>
          )}
          <h2 className="text-xl font-bold text-white">{food.nameTH}</h2>
          <p className="text-sm text-white/50">{food.nameEN}</p>
        </div>
        <p className="text-sm leading-relaxed text-white/70">{food.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {food.availableAt.map((v) => (
            <span key={v} className="text-[11px] px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
              {VENUE_LABELS[v].emoji} {VENUE_LABELS[v].label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span style={{ color: "var(--orange)" }}>🔥 {food.calories} cal</span>
          <span className="text-white/20">·</span>
          <span style={{ color: "#4ade80" }}>฿{food.priceMin}-{food.priceMax}</span>
        </div>
        {showFindNearby && (
          <button
            onClick={onFindNearby}
            className="w-full mt-1 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            style={{ background: "var(--orange-bg)", color: "var(--orange)", border: "none" }}
          >
            📍 หาร้านใกล้ฉัน
          </button>
        )}
        {geoDenied && (
          <p className="text-xs text-white/40 mt-1">
            ไม่สามารถเข้าถึงตำแหน่งที่ตั้ง เปิดในการตั้งค่าเบราว์เซอร์เพื่อค้นหาร้านอาหารใกล้เคียง
          </p>
        )}
      </div>
    </div>
  );
}
