import { motion } from "framer-motion";
import type { AppPhase } from "../types/food";

interface RandomizeButtonProps {
  phase: AppPhase;
  disabled: boolean;
  onClick: () => void;
}

export function RandomizeButton({ phase, disabled, onClick }: RandomizeButtonProps) {
  const isSpinning = phase === "spinning";
  const label = isSpinning ? "🎰 กำลังสุ่ม..." : phase === "result" ? "🔄 อีกที!" : "🎲 สุ่มเลย!";

  return (
    <div className="px-4 flex justify-center">
      <motion.button
        whileTap={!isSpinning && !disabled ? { scale: 0.95 } : undefined}
        whileHover={!isSpinning && !disabled ? { scale: 1.02 } : undefined}
        onClick={onClick}
        disabled={isSpinning || disabled}
        className="min-h-[56px] w-full max-w-xs rounded-2xl text-white font-bold text-lg cursor-pointer transition-opacity"
        style={{
          background: disabled ? "rgba(255,255,255,0.1)" : "#FF6B35",
          boxShadow: disabled ? "none" : "0 4px 20px rgba(255,107,53,0.4)",
          opacity: isSpinning ? 0.7 : disabled ? 0.4 : 1,
          cursor: isSpinning || disabled ? "not-allowed" : "pointer",
        }}
      >
        {isSpinning ? (
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            {label}
          </motion.span>
        ) : (
          label
        )}
      </motion.button>
    </div>
  );
}
