import { motion } from "framer-motion";

interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex flex-col items-center justify-center gap-3 py-16 px-4"
    >
      <span className="text-5xl">😅</span>
      <p className="text-white/60 text-base font-medium">ไม่เจอเลย...</p>
      <p className="text-white/30 text-sm">ลองเลือก filter ใหม่นะ</p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="mt-2 min-h-[44px] px-6 rounded-full text-sm font-medium cursor-pointer"
        style={{
          background: "rgba(255,107,53,0.15)",
          color: "var(--orange)",
          border: "1px solid rgba(255,107,53,0.25)",
        }}
      >
        รีเซ็ต filter
      </motion.button>
    </motion.div>
  );
}
