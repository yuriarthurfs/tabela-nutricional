export interface NutrientValues {
  energyKcal: number;
  energyKj: number;
  carbohydrates: number;
  totalSugars: number;
  addedSugars: number;
  proteins: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  fiber: number;
  sodium: number;
}

export interface IngredientData {
  name: string;
  quantityG: number;
  nutrientsPer100g: Partial<NutrientValues>;
}

export interface RecipeData {
  ingredients: IngredientData[];
  finalYieldG: number;
  numPortions: number;
  addedSugarsG: number;
  productType: 'solid' | 'liquid';
}

export interface NutritionResults {
  totalsRecipe: NutrientValues;
  perPortion: NutrientValues;
  per100g: NutrientValues;
  vdPercent: Partial<Record<keyof NutrientValues, number>>;
  displayValues: {
    perPortion: Record<string, string>;
    per100g: Record<string, string>;
  };
}

export interface FrontLabelResult {
  altoEmAddedSugar: boolean;
  altoEmSatFat: boolean;
  altoEmSodium: boolean;
}
