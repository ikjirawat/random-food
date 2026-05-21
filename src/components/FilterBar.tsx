import { motion } from "framer-motion";
import type { FilterState, MealType, HealthMode, Venue, BudgetMood } from "../types/food";

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  autoMealType?: MealType | "any";
}

const MEAL_TYPES: { value: MealType | "any"; label: string; emoji: string }[] = [
  { value: "any", label: "ทั้งหมด", emoji: "🍽" },
  { value: "breakfast", label: "เช้า", emoji: "🌅" },
  { value: "lunch", label: "กลางวัน", emoji: "🍛" },
  { value: "dinner", label: "เย็น", emoji: "🌙" },
  { value: "snack", label: "ของว่าง", emoji: "🍿" },
];

const HEALTH_MODES: { value: HealthMode | "any"; label: string; emoji: string }[] = [
  { value: "any", label: "ทั้งหมด", emoji: "🍽" },
  { value: "healthy", label: "สุขภาพ", emoji: "🥗" },
  { value: "normal", label: "ปกติ", emoji: "🍔" },
];

const VENUES: { value: Venue | "any"; label: string; emoji: string }[] = [
  { value: "any", label: "ทั้งหมด", emoji: "📍" },
  { value: "7-11", label: "เซเว่น", emoji: "🏪" },
  { value: "street", label: "ริมทาง", emoji: "🛒" },
  { value: "restaurant", label: "ร้านตามสั่ง", emoji: "🍽" },
  { value: "home", label: "ทำเอง", emoji: "🏠" },
];

const BUDGETS: { value: BudgetMood; label: string; emoji: string }[] = [
  { value: "any", label: "ทั้งหมด", emoji: "💰" },
  { value: "broke", label: "สิ้นเดือน", emoji: "😅" },
  { value: "normal", label: "ปกติ", emoji: "🍽" },
];

function Pill({ active, label, emoji, onClick, autoIcon }: {
  active: boolean; label: string; emoji: string; onClick: () => void; autoIcon?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-pressed={active}
      className="min-h-[44px] px-4 rounded-full text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
      style={{
        background: active ? "var(--orange-bg)" : "rgba(255,255,255,0.06)",
        color: active ? "var(--orange)" : "rgba(255,255,255,0.5)",
        border: `1px solid ${active ? "var(--orange-border)" : "var(--border-light)"}`,
      }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      {autoIcon && <span className="text-[10px] opacity-60">⏰</span>}
    </motion.button>
  );
}

export function FilterBar({ filters, onChange, autoMealType }: FilterBarProps) {
  const setMealType = (v: MealType | "any") => {
    onChange({ ...filters, mealType: filters.mealType === v ? "any" : v });
  };

  const setHealthMode = (v: HealthMode | "any") => {
    onChange({ ...filters, healthMode: filters.healthMode === v ? "any" : v });
  };

  const setVenue = (v: Venue | "any") => {
    onChange({ ...filters, availableAt: filters.availableAt === v ? "any" : v });
  };

  const setBudget = (v: BudgetMood) => {
    onChange({ ...filters, budgetMood: filters.budgetMood === v ? "any" : v });
  };

  return (
    <div className="flex flex-col gap-2.5 px-4">
      <div className="flex flex-wrap gap-2">
        {MEAL_TYPES.map((m) => (
          <Pill
            key={m.value}
            active={filters.mealType === m.value}
            label={m.label}
            emoji={m.emoji}
            onClick={() => setMealType(m.value)}
            autoIcon={autoMealType === m.value && filters.mealType === m.value}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {HEALTH_MODES.map((h) => (
          <Pill key={h.value} active={filters.healthMode === h.value} label={h.label} emoji={h.emoji} onClick={() => setHealthMode(h.value)} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {VENUES.map((v) => (
          <Pill key={v.value} active={filters.availableAt === v.value} label={v.label} emoji={v.emoji} onClick={() => setVenue(v.value)} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {BUDGETS.map((b) => (
          <Pill key={b.value} active={filters.budgetMood === b.value} label={b.label} emoji={b.emoji} onClick={() => setBudget(b.value)} />
        ))}
      </div>
    </div>
  );
}
