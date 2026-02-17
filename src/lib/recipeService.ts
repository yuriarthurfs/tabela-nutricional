import { supabase } from './supabase';
import { NutritionResults } from './nutritionEngine';

export interface RecipeToSave {
  name: string;
  category: string;
  productType: 'solid' | 'liquid';
  finalYieldG: number;
  portionG: number;
  householdMeasure: string;
  numPortions: number;
  ingredients: Array<{
    tacoFoodId: string;
    name: string;
    quantityG: number;
    nutrients: any;
  }>;
  addedSugarsG: number;
  nutritionResults: NutritionResults;
  allergens: {
    contem: string[];
    podeConter: string[];
  };
}

export async function saveRecipe(recipe: RecipeToSave): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Você precisa estar autenticado para salvar receitas');
      return null;
    }

    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        user_id: user.id,
        name: recipe.name,
        category: recipe.category,
        product_type: recipe.productType,
        final_yield_g: recipe.finalYieldG,
        portion_g: recipe.portionG,
        household_measure: recipe.householdMeasure,
        num_portions: recipe.numPortions,
      })
      .select('id')
      .single();

    if (recipeError || !recipeData) {
      console.error('Erro ao salvar receita:', recipeError);
      alert('Erro ao salvar receita');
      return null;
    }

    const recipeId = recipeData.id;

    const ingredientLines = recipe.ingredients.map(ing => ({
      recipe_id: recipeId,
      taco_food_id: ing.tacoFoodId,
      name: ing.name,
      quantity_g: ing.quantityG,
      nutrients_100g_snapshot: ing.nutrients,
    }));

    const { error: ingredientsError } = await supabase
      .from('ingredient_lines')
      .insert(ingredientLines);

    if (ingredientsError) {
      console.error('Erro ao salvar ingredientes:', ingredientsError);
    }

    const { error: nutritionError } = await supabase
      .from('nutrition_totals')
      .insert({
        recipe_id: recipeId,
        totals_recipe: recipe.nutritionResults.totalsRecipe,
        per_portion: recipe.nutritionResults.perPortion,
        per_100g: recipe.nutritionResults.per100g,
      });

    if (nutritionError) {
      console.error('Erro ao salvar nutrição:', nutritionError);
    }

    const { error: allergenError } = await supabase
      .from('allergens')
      .insert({
        recipe_id: recipeId,
        contem: recipe.allergens.contem,
        pode_conter: recipe.allergens.podeConter,
      });

    if (allergenError) {
      console.error('Erro ao salvar alergênicos:', allergenError);
    }

    alert('Receita salva com sucesso!');
    return recipeId;
  } catch (err) {
    console.error('Erro ao salvar receita:', err);
    alert('Erro ao salvar receita');
    return null;
  }
}

export async function getRecipes() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar receitas:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Erro ao buscar receitas:', err);
    return [];
  }
}
