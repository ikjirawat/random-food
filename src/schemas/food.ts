import { z } from "zod";

export const FoodItemSchema = z.object({
  id: z.string(),
  nameTH: z.string(),
  nameEN: z.string(),
  emoji: z.string(),
  description: z.string(),
  image: z.string(),
  category: z.enum(["healthy", "normal"]),
  mealTypes: z.array(z.enum(["breakfast", "lunch", "dinner", "snack"])),
  availableAt: z.array(z.enum(["7-11", "street", "restaurant", "home"])),
  calories: z.number(),
  priceMin: z.number(),
  priceMax: z.number(),
});

export type FoodItem = z.infer<typeof FoodItemSchema>;
