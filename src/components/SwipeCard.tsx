import { motion, useMotionValue, useTransform } from "framer-motion";
import { FoodCard } from "./FoodCard";
import type { FoodItem } from "../types/food";

interface SwipeCardProps {
  food: FoodItem;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  recentLabel?: string;
}

export function SwipeCard({ food, onSwipeLeft, onSwipeRight, recentLabel }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const leftOpacity = useTransform(x, [-150, -50], [1, 0]);
  const rightOpacity = useTransform(x, [50, 150], [0, 1]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      style={{ x, rotate, cursor: "grab" }}
      onDragEnd={(_, info) => {
        if (info.offset.x < -100) onSwipeLeft();
        else if (info.offset.x > 100) onSwipeRight();
      }}
      exit={{
        x: x.get() < 0 ? -400 : 400,
        opacity: 0,
        rotate: x.get() < 0 ? -30 : 30,
        transition: { duration: 0.3 },
      }}
      className="relative"
    >
      <motion.div
        className="absolute -top-4 left-4 z-10 px-3 py-1.5 rounded-lg text-sm font-bold"
        style={{
          opacity: leftOpacity,
          background: "rgba(239,68,68,0.2)",
          color: "#EF4444",
          border: "1px solid rgba(239,68,68,0.3)",
        }}
      >
        ไม่เอา!
      </motion.div>
      <motion.div
        className="absolute -top-4 right-4 z-10 px-3 py-1.5 rounded-lg text-sm font-bold"
        style={{
          opacity: rightOpacity,
          background: "rgba(34,197,94,0.2)",
          color: "#22C55E",
          border: "1px solid rgba(34,197,94,0.3)",
        }}
      >
        เอา!
      </motion.div>
      <FoodCard food={food} recentLabel={recentLabel} />
    </motion.div>
  );
}
