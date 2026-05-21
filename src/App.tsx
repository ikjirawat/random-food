import { useState, useMemo, useCallback } from "react";
import foods from "./data/foods.json";
import type { FoodItem, AppPhase, FilterState, MealType } from "./types/food";
import { FoodItemSchema } from "./schemas/food";
import { FilterBar } from "./components/FilterBar";
import { ShuffleZone } from "./components/ShuffleZone";
import { RandomizeButton } from "./components/RandomizeButton";
import { EmptyState } from "./components/EmptyState";
import { DiscoveryGrid } from "./components/DiscoveryGrid";
import { SwipeMode } from "./components/SwipeMode";
import { useHistory } from "./hooks/useHistory";
import { useGeolocation } from "./hooks/useGeolocation";

const typedFoods = FoodItemSchema.array().parse(foods);

function getDefaultMealType(): MealType | "any" {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 14) return "lunch";
  if (hour >= 14 && hour < 17) return "snack";
  return "dinner";
}

function getDefaultFilters(): FilterState {
  return {
    mealType: getDefaultMealType(),
    healthMode: "any",
    availableAt: "any",
    budgetMood: "any",
  };
}

function App() {
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters);
  const [autoMealType] = useState(() => getDefaultMealType());
  const [mealOverridden, setMealOverridden] = useState(false);
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [currentFood, setCurrentFood] = useState<FoodItem | null>(null);
  const [prevFoodId, setPrevFoodId] = useState<string | null>(null);
  const [ghostFoods, setGhostFoods] = useState<FoodItem[]>([]);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [mode, setMode] = useState<"random" | "swipe">("random");
  const history = useHistory();
  const geo = useGeolocation();

  const filteredFoods = useMemo(() => {
    return typedFoods.filter((f) => {
      if (filters.mealType !== "any" && !f.mealTypes.includes(filters.mealType)) return false;
      if (filters.healthMode !== "any" && f.category !== filters.healthMode) return false;
      if (filters.availableAt !== "any" && !f.availableAt.includes(filters.availableAt)) return false;
      if (filters.budgetMood === "broke" && f.priceMax > 60) return false;
      if (filters.budgetMood === "normal" && f.priceMax > 150) return false;
      return true;
    });
  }, [filters]);

  const updateFilters = useCallback((newFilters: FilterState) => {
    if (newFilters.mealType !== filters.mealType) {
      setMealOverridden(true);
    }
    setFilters(newFilters);
    setPhase("idle");
    setCurrentFood(null);
  }, [filters.mealType]);

  const resetFilters = useCallback(() => {
    setFilters(getDefaultFilters());
    setMealOverridden(false);
    setPhase("idle");
    setCurrentFood(null);
  }, []);

  const randomize = useCallback(() => {
    if (phase === "spinning") return;
    if (filteredFoods.length === 0) return;
    if (filteredFoods.length === 1) {
      setCurrentFood(filteredFoods[0]);
      history.addPick(filteredFoods[0].id);
      setPhase("result");
      return;
    }

    const ghosts: FoodItem[] = [];
    const ghostPool = filteredFoods.filter((f) => f.id !== prevFoodId);
    for (let i = 0; i < 3 && ghostPool.length > 0; i++) {
      const idx = Math.floor(Math.random() * ghostPool.length);
      ghosts.push(ghostPool.splice(idx, 1)[0]);
    }
    setGhostFoods(ghosts);

    const weightedPool = history.getWeightedPool(
      filteredFoods.filter((f) => f.id !== prevFoodId)
    );
    const pick = weightedPool.length > 0
      ? weightedPool[Math.floor(Math.random() * weightedPool.length)]
      : filteredFoods[0];

    setPhase("spinning");
    setTimeout(() => {
      setCurrentFood(pick);
      setPrevFoodId(pick.id);
      history.addPick(pick.id);
      setPhase("result");
    }, 1200);
  }, [filteredFoods, prevFoodId, phase, history]);

  const handleSwipeAccept = useCallback((food: FoodItem) => {
    setCurrentFood(food);
    setPrevFoodId(food.id);
    history.addPick(food.id);
    setMode("random");
    setPhase("result");
  }, [history]);

  const handleSwipeExhausted = useCallback(() => {
    setMode("random");
    randomize();
  }, [randomize]);

  const recentLabel = currentFood && history.wasEatenRecently(currentFood.id, 1)
    ? "กินเมื่อวาน"
    : currentFood && history.wasEatenRecently(currentFood.id, 3)
    ? "กินบ่อย"
    : undefined;

  const swipeRecentLabel = useCallback((food: FoodItem) => {
    if (history.wasEatenRecently(food.id, 1)) return "กินเมื่อวาน";
    if (history.wasEatenRecently(food.id, 3)) return "กินบ่อย";
    return undefined;
  }, [history]);

  const isEmpty = filteredFoods.length === 0;
  const triedCount = history.getTriedCount();
  const triedIds = useMemo(() => new Set(history.load().map((e) => e.foodId)), [phase]);

  return (
    <div className="min-h-screen bg-[var(--bg-surface)] text-white">
      <div className="max-w-md mx-auto flex flex-col gap-5 py-6">
        <header className="text-center px-4">
          <h1 className="text-2xl font-bold">กินอะไรดี?</h1>
          <p className="text-white/40 text-sm mt-0.5">What should I eat?</p>
        </header>

        <FilterBar
          filters={filters}
          onChange={updateFilters}
          autoMealType={mealOverridden ? undefined : autoMealType}
        />

        {/* Mode toggle */}
        <div className="flex justify-center gap-2 px-4">
          <button
            onClick={() => setMode("random")}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{
              background: mode === "random" ? "var(--orange-bg)" : "rgba(255,255,255,0.06)",
              color: mode === "random" ? "var(--orange)" : "rgba(255,255,255,0.5)",
              border: `1px solid ${mode === "random" ? "var(--orange-border)" : "var(--border-light)"}`,
            }}
          >
            🎲 สุ่ม
          </button>
          <button
            onClick={() => { setMode("swipe"); setPhase("idle"); }}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{
              background: mode === "swipe" ? "var(--orange-bg)" : "rgba(255,255,255,0.06)",
              color: mode === "swipe" ? "var(--orange)" : "rgba(255,255,255,0.5)",
              border: `1px solid ${mode === "swipe" ? "var(--orange-border)" : "var(--border-light)"}`,
            }}
          >
            👆 ปัด
          </button>
        </div>

        {isEmpty ? (
          <EmptyState onReset={resetFilters} />
        ) : mode === "random" ? (
          <>
            <ShuffleZone
              phase={phase}
              currentFood={currentFood}
              ghostFoods={ghostFoods}
              recentLabel={recentLabel}
              geo={geo}
            />
            <RandomizeButton phase={phase} disabled={isEmpty} onClick={randomize} />
          </>
        ) : (
          <SwipeMode
            foods={filteredFoods}
            onAccept={handleSwipeAccept}
            onExhausted={handleSwipeExhausted}
            recentLabel={swipeRecentLabel}
          />
        )}

        {/* Discovery counter */}
        <button
          onClick={() => setShowDiscovery(true)}
          className="text-center text-white/40 text-xs font-mono hover:text-white/60 transition-colors cursor-pointer bg-transparent border-none"
        >
          ลองแล้ว {triedCount}/{typedFoods.length} · {filteredFoods.length} ตรงเงื่อนไข
        </button>

        <footer className="text-center text-white/40 text-xs pb-4">
          by Ik ☕
        </footer>
      </div>

      {showDiscovery && (
        <DiscoveryGrid
          foods={typedFoods}
          triedIds={triedIds}
          onClose={() => setShowDiscovery(false)}
        />
      )}
    </div>
  );
}

export default App;
