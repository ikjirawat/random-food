import { useState, useMemo, useCallback } from "react";
import foods from "./data/foods.json";
import type { FoodItem, AppPhase, FilterState } from "./types/food";
import { FilterBar } from "./components/FilterBar";
import { ShuffleZone } from "./components/ShuffleZone";
import { RandomizeButton } from "./components/RandomizeButton";
import { EmptyState } from "./components/EmptyState";

const typedFoods = foods as unknown as FoodItem[];

const DEFAULT_FILTERS: FilterState = {
  mealType: "any",
  healthMode: "any",
  availableAt: "any",
};

function App() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [currentFood, setCurrentFood] = useState<FoodItem | null>(null);
  const [prevFoodId, setPrevFoodId] = useState<string | null>(null);
  const [ghostFoods, setGhostFoods] = useState<FoodItem[]>([]);

  const filteredFoods = useMemo(() => {
    return typedFoods.filter((f) => {
      if (filters.mealType !== "any" && !f.mealTypes.includes(filters.mealType)) return false;
      if (filters.healthMode !== "any" && f.category !== filters.healthMode) return false;
      if (filters.availableAt !== "any" && !f.availableAt.includes(filters.availableAt)) return false;
      return true;
    });
  }, [filters]);

  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setPhase("idle");
    setCurrentFood(null);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPhase("idle");
    setCurrentFood(null);
  }, []);

  const randomize = useCallback(() => {
    if (filteredFoods.length === 0) return;
    if (filteredFoods.length === 1) {
      setCurrentFood(filteredFoods[0]);
      setPhase("result");
      return;
    }

    const ghosts: FoodItem[] = [];
    const pool = filteredFoods.filter((f) => f.id !== prevFoodId);
    for (let i = 0; i < 3 && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      ghosts.push(pool.splice(idx, 1)[0]);
    }
    setGhostFoods(ghosts);

    let pick = filteredFoods[Math.floor(Math.random() * filteredFoods.length)];
    if (pick.id === prevFoodId && filteredFoods.length > 1) {
      pick = filteredFoods[Math.floor(Math.random() * filteredFoods.length)];
    }

    setPhase("spinning");
    setTimeout(() => {
      setCurrentFood(pick);
      setPrevFoodId(pick.id);
      setPhase("result");
    }, 1200);
  }, [filteredFoods, prevFoodId]);

  const isEmpty = filteredFoods.length === 0;

  return (
    <div className="min-h-screen bg-[#0F0F14] text-white">
      <div className="max-w-md mx-auto flex flex-col gap-5 py-6">
        {/* Header */}
        <header className="text-center px-4">
          <h1 className="text-2xl font-bold">กินอะไรดี?</h1>
          <p className="text-white/40 text-sm mt-0.5">What should I eat?</p>
        </header>

        <FilterBar filters={filters} onChange={updateFilters} />

        {isEmpty ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <>
            <ShuffleZone phase={phase} currentFood={currentFood} ghostFoods={ghostFoods} />
            <RandomizeButton phase={phase} disabled={isEmpty} onClick={randomize} />
          </>
        )}

        {/* Match count */}
        <p className="text-center text-white/20 text-xs font-mono">
          {filteredFoods.length} / {typedFoods.length} foods
        </p>

        {/* Footer */}
        <footer className="text-center text-white/15 text-xs pb-4">
          by Ik ☕
        </footer>
      </div>
    </div>
  );
}

export default App;
