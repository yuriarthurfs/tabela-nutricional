import { IngredientData, NutrientValues, RecipeData, NutritionResults, FrontLabelResult } from './types';
import { VDR_TABLE, FRONT_LABEL_LIMITS } from './constants';
import { applyZeroRule, formatDisplayValue } from './rounding';

export function computeTotals(
  ingredients: IngredientData[],
  addedSugarsG: number
): Partial<NutrientValues> {
  const totals: Partial<NutrientValues> = {
    carbohydrates: 0,
    totalSugars: 0,
    addedSugars: addedSugarsG,
    proteins: 0,
    totalFat: 0,
    saturatedFat: 0,
    transFat: 0,
    fiber: 0,
    sodium: 0,
  };

  for (const ingredient of ingredients) {
    const factor = ingredient.quantityG / 100;

    totals.carbohydrates! += (ingredient.nutrientsPer100g.carbohydrates || 0) * factor;
    totals.totalSugars! += (ingredient.nutrientsPer100g.totalSugars || 0) * factor;
    totals.proteins! += (ingredient.nutrientsPer100g.proteins || 0) * factor;
    totals.totalFat! += (ingredient.nutrientsPer100g.totalFat || 0) * factor;
    totals.saturatedFat! += (ingredient.nutrientsPer100g.saturatedFat || 0) * factor;
    totals.transFat! += (ingredient.nutrientsPer100g.transFat || 0) * factor;
    totals.fiber! += (ingredient.nutrientsPer100g.fiber || 0) * factor;
    totals.sodium! += (ingredient.nutrientsPer100g.sodium || 0) * factor;
  }

  return totals;
}

export function computeEnergy(nutrients: Partial<NutrientValues>): { kcal: number; kj: number } {
  const carbs = nutrients.carbohydrates || 0;
  const proteins = nutrients.proteins || 0;
  const fats = nutrients.totalFat || 0;

  const kcal = (carbs * 4) + (proteins * 4) + (fats * 9);
  const kj = kcal * 4.2;

  return { kcal, kj };
}

export function computePerPortion(
  totals: Partial<NutrientValues>,
  numPortions: number
): NutrientValues {
  const portionValues: any = {};

  for (const key in totals) {
    portionValues[key] = (totals[key as keyof NutrientValues] || 0) / numPortions;
  }

  const energy = computeEnergy(portionValues);
  portionValues.energyKcal = energy.kcal;
  portionValues.energyKj = energy.kj;

  return portionValues as NutrientValues;
}

export function computePer100g(
  totals: Partial<NutrientValues>,
  finalYieldG: number
): NutrientValues {
  const per100g: any = {};

  for (const key in totals) {
    per100g[key] = ((totals[key as keyof NutrientValues] || 0) / finalYieldG) * 100;
  }

  const energy = computeEnergy(per100g);
  per100g.energyKcal = energy.kcal;
  per100g.energyKj = energy.kj;

  return per100g as NutrientValues;
}

export function computeVD(
  perPortion: NutrientValues
): Partial<Record<keyof NutrientValues, number>> {
  return {
    energyKcal: (perPortion.energyKcal / VDR_TABLE.energyKcal) * 100,
    energyKj: (perPortion.energyKj / VDR_TABLE.energyKj) * 100,
    carbohydrates: (perPortion.carbohydrates / VDR_TABLE.carbohydrates) * 100,
    addedSugars: (perPortion.addedSugars / VDR_TABLE.addedSugars) * 100,
    proteins: (perPortion.proteins / VDR_TABLE.proteins) * 100,
    totalFat: (perPortion.totalFat / VDR_TABLE.totalFat) * 100,
    saturatedFat: (perPortion.saturatedFat / VDR_TABLE.saturatedFat) * 100,
    transFat: (perPortion.transFat / VDR_TABLE.transFat) * 100,
    fiber: (perPortion.fiber / VDR_TABLE.fiber) * 100,
    sodium: (perPortion.sodium / VDR_TABLE.sodium) * 100,
  };
}

export function applyRoundingAndZeroRules(values: NutrientValues): {
  rounded: NutrientValues;
  display: Record<string, string>;
} {
  const rounded: any = {};
  const display: any = {};

  rounded.energyKcal = applyZeroRule(values.energyKcal, 'energyKcal');
  rounded.energyKj = rounded.energyKcal * 4.2;
  display.energyKcal = formatDisplayValue(rounded.energyKcal, 'kcal');
  display.energyKj = formatDisplayValue(rounded.energyKj, 'kj');

  rounded.carbohydrates = applyZeroRule(values.carbohydrates, 'carbohydrates');
  display.carbohydrates = formatDisplayValue(rounded.carbohydrates, 'g');

  rounded.totalSugars = values.totalSugars;
  display.totalSugars = formatDisplayValue(rounded.totalSugars, 'g');

  rounded.addedSugars = values.addedSugars;
  display.addedSugars = formatDisplayValue(rounded.addedSugars, 'g');

  rounded.proteins = applyZeroRule(values.proteins, 'proteins');
  display.proteins = formatDisplayValue(rounded.proteins, 'g');

  rounded.totalFat = applyZeroRule(values.totalFat, 'totalFat');
  display.totalFat = formatDisplayValue(rounded.totalFat, 'g');

  rounded.saturatedFat = applyZeroRule(values.saturatedFat, 'saturatedFat');
  display.saturatedFat = formatDisplayValue(rounded.saturatedFat, 'g');

  rounded.transFat = applyZeroRule(values.transFat, 'transFat');
  display.transFat = formatDisplayValue(rounded.transFat, 'g');

  rounded.fiber = applyZeroRule(values.fiber, 'fiber');
  display.fiber = formatDisplayValue(rounded.fiber, 'g');

  rounded.sodium = applyZeroRule(values.sodium, 'sodium');
  display.sodium = formatDisplayValue(rounded.sodium, 'mg');

  return { rounded, display };
}

export function computeFrontLabel(
  per100g: NutrientValues,
  productType: 'solid' | 'liquid'
): FrontLabelResult {
  const limits = FRONT_LABEL_LIMITS[productType];

  return {
    altoEmAddedSugar: per100g.addedSugars >= limits.addedSugars,
    altoEmSatFat: per100g.saturatedFat >= limits.saturatedFat,
    altoEmSodium: per100g.sodium >= limits.sodium,
  };
}

export function calculateNutrition(recipeData: RecipeData): NutritionResults {
  const totalsRecipe = computeTotals(recipeData.ingredients, recipeData.addedSugarsG);

  const perPortion = computePerPortion(totalsRecipe, recipeData.numPortions);
  const per100g = computePer100g(totalsRecipe, recipeData.finalYieldG);

  const vdPercent = computeVD(perPortion);

  const portionRounded = applyRoundingAndZeroRules(perPortion);
  const per100gRounded = applyRoundingAndZeroRules(per100g);

  return {
    totalsRecipe: { ...totalsRecipe, ...computeEnergy(totalsRecipe) } as NutrientValues,
    perPortion: portionRounded.rounded,
    per100g: per100gRounded.rounded,
    vdPercent,
    displayValues: {
      perPortion: portionRounded.display,
      per100g: per100gRounded.display,
    },
  };
}
