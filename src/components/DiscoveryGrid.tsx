import { motion } from "framer-motion";
import type { FoodItem } from "../types/food";

interface DiscoveryGridProps {
  foods: FoodItem[];
  triedIds: Set<string>;
  onClose: () => void;
}

export function DiscoveryGrid({ foods, triedIds, onClose }: DiscoveryGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-t-2xl p-5"
        style={{ background: "var(--bg-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            ลองแล้ว {triedIds.size}/{foods.length}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
            style={{ background: "rgba(255,255,255,0.08)", border: "none" }}
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {foods.map((food) => {
            const tried = triedIds.has(food.id);
            return (
              <div
                key={food.id}
                className="flex flex-col items-center gap-1 p-2 rounded-xl text-center"
                style={{
                  background: tried ? "var(--teal-bg)" : "rgba(255,255,255,0.04)",
                  opacity: tried ? 1 : 0.5,
                }}
              >
                <span className="text-2xl">{food.emoji}</span>
                <span className="text-[10px] text-white/70 leading-tight line-clamp-2">{food.nameTH}</span>
                {tried && <span className="text-[10px]" style={{ color: "var(--teal)" }}>✓</span>}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
