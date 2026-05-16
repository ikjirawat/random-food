import foods from './data/foods.json';
import type { FoodItem } from './types/food';

const typedFoods = foods as unknown as FoodItem[];

function App() {
  return (
    <div className="min-h-screen bg-[#0F0F14] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">กินอะไรดี?</h1>
        <p className="text-white/50 mt-2">{typedFoods.length} foods loaded</p>
      </div>
    </div>
  );
}

export default App;
