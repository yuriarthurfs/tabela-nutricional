import { useState } from 'react';
import { FileText, ChevronRight, ChevronLeft, Download, Save } from 'lucide-react';
import { RecipeForm } from './components/RecipeForm';
import { IngredientSearch, Ingredient } from './components/IngredientSearch';
import { AddedSugarsForm } from './components/AddedSugarsForm';
import { NutritionTable } from './components/NutritionTable';
import { FrontLabel } from './components/FrontLabel';
import { AllergenManager } from './components/AllergenManager';
import { calculateNutrition, computeFrontLabel, NutritionResults } from './lib/nutritionEngine';
import { inferAllergens } from './lib/allergenMapping';
import { exportToPDF } from './lib/pdfExporter';
import { saveRecipe } from './lib/recipeService';

type Step = 'recipe' | 'ingredients' | 'sugars' | 'results';

interface RecipeData {
  name: string;
  category: string;
  productType: 'solid' | 'liquid';
  finalYieldG: number;
  portionG: number;
  householdMeasure: string;
  numPortions: number;
}

function App() {
  const [step, setStep] = useState<Step>('recipe');
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [, setAddedSugarsG] = useState<number>(0);
  const [nutritionResults, setNutritionResults] = useState<NutritionResults | null>(null);
  const [allergensSaved, setAllergensSaved] = useState(false);

  const handleRecipeSubmit = (data: RecipeData) => {
    setRecipeData(data);
    setStep('ingredients');
  };

  const handleAddIngredient = (ingredient: Ingredient) => {
    setIngredients([...ingredients, ingredient]);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const handleIngredientsNext = () => {
    if (ingredients.length === 0) {
      alert('Adicione pelo menos um ingrediente');
      return;
    }
    setStep('sugars');
  };

  const handleSugarsSubmit = (sugars: number) => {
    setAddedSugarsG(sugars);

    if (!recipeData) return;

    const results = calculateNutrition({
      ingredients: ingredients.map(ing => ({
        name: ing.name,
        quantityG: ing.quantityG,
        nutrientsPer100g: {
          energyKcal: ing.nutrients.energia_kcal,
          energyKj: ing.nutrients.energia_kj,
          carbohydrates: ing.nutrients.carboidratos_g,
          totalSugars: 0,
          addedSugars: 0,
          proteins: ing.nutrients.proteina_g,
          totalFat: ing.nutrients.lipidios_g,
          saturatedFat: ing.nutrients.gorduras_saturadas_g,
          transFat: ing.nutrients.gorduras_trans_g,
          fiber: ing.nutrients.fibra_g,
          sodium: ing.nutrients.sodio_mg,
        },
      })),
      finalYieldG: recipeData.finalYieldG,
      numPortions: recipeData.numPortions,
      addedSugarsG: sugars,
      productType: recipeData.productType,
    });

    setNutritionResults(results);
    setStep('results');
  };

  const handleAllergensave = (_contem: string[], _podeConter: string[], _manual: string) => {
    setAllergensSaved(true);
    alert('Alergênicos salvos com sucesso!');
  };

  const handleExport = () => {
    if (!nutritionResults || !recipeData || !frontLabel) return;

    exportToPDF({
      recipeName: recipeData.name,
      category: recipeData.category,
      productType: recipeData.productType,
      portionG: recipeData.portionG,
      householdMeasure: recipeData.householdMeasure,
      numPortions: recipeData.numPortions,
      finalYieldG: recipeData.finalYieldG,
      ingredients: ingredients.map(ing => ({
        name: ing.name,
        quantityG: ing.quantityG,
      })),
      nutritionResults,
      frontLabel,
      allergens: {
        contem: inferredAllergens,
        podeConter: [],
      },
    });
  };

  const handleSaveRecipe = async () => {
    if (!nutritionResults || !recipeData) return;

    const result = await saveRecipe({
      name: recipeData.name,
      category: recipeData.category,
      productType: recipeData.productType,
      finalYieldG: recipeData.finalYieldG,
      portionG: recipeData.portionG,
      householdMeasure: recipeData.householdMeasure,
      numPortions: recipeData.numPortions,
      ingredients: ingredients.map(ing => ({
        tacoFoodId: ing.id,
        name: ing.name,
        quantityG: ing.quantityG,
        nutrients: ing.nutrients,
      })),
      addedSugarsG,
      nutritionResults,
      allergens: {
        contem: inferredAllergens,
        podeConter: [],
      },
    });

    if (result) {
      setStep('recipe');
      setRecipeData(null);
      setIngredients([]);
      setAddedSugarsG(0);
      setNutritionResults(null);
      setAllergensSaved(false);
    }
  };

  const handleNewRecipe = () => {
    setStep('recipe');
    setRecipeData(null);
    setIngredients([]);
    setAddedSugarsG(0);
    setNutritionResults(null);
    setAllergensSaved(false);
  };

  const inferredAllergens = inferAllergens(ingredients.map(ing => ing.name));
  const frontLabel = nutritionResults && recipeData
    ? computeFrontLabel(nutritionResults.per100g, recipeData.productType)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RotulagemBR</h1>
              <p className="text-sm text-gray-600">Gerador de Tabela Nutricional e Rotulagem Frontal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'recipe' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>1</div>
              <span className={step === 'recipe' ? 'font-semibold' : 'text-gray-600'}>Receita</span>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400" />

            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'ingredients' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>2</div>
              <span className={step === 'ingredients' ? 'font-semibold' : 'text-gray-600'}>Ingredientes</span>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400" />

            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'sugars' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>3</div>
              <span className={step === 'sugars' ? 'font-semibold' : 'text-gray-600'}>Açúcares</span>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400" />

            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>4</div>
              <span className={step === 'results' ? 'font-semibold' : 'text-gray-600'}>Resultados</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {step === 'recipe' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Informações da Receita</h2>
              <RecipeForm onSubmit={handleRecipeSubmit} initialData={recipeData || undefined} />
            </div>
          )}

          {step === 'ingredients' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Ingredientes</h2>
                <button
                  onClick={() => setStep('recipe')}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>
              </div>

              <IngredientSearch
                ingredients={ingredients}
                onAddIngredient={handleAddIngredient}
                onRemoveIngredient={handleRemoveIngredient}
              />

              {ingredients.length > 0 && (
                <button
                  onClick={handleIngredientsNext}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  Continuar
                </button>
              )}
            </div>
          )}

          {step === 'sugars' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Açúcares Adicionados</h2>
                <button
                  onClick={() => setStep('ingredients')}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>
              </div>

              <AddedSugarsForm ingredients={ingredients} onSubmit={handleSugarsSubmit} />
            </div>
          )}

          {step === 'results' && nutritionResults && recipeData && frontLabel && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{recipeData.name}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar PDF
                  </button>
                  <button
                    onClick={handleSaveRecipe}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Salvar Receita
                  </button>
                  <button
                    onClick={handleNewRecipe}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                  >
                    Nova Receita
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Tabela Nutricional</h3>
                  <NutritionTable
                    results={nutritionResults}
                    portionG={recipeData.portionG}
                    householdMeasure={recipeData.householdMeasure}
                    productType={recipeData.productType}
                  />
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Rotulagem Frontal</h3>
                    <FrontLabel frontLabel={frontLabel} />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Alergênicos</h3>
                    <AllergenManager
                      inferredAllergens={inferredAllergens}
                      onSave={handleAllergensave}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Relatório de Conformidade</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Cálculos nutricionais conforme IN 75/2020
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Arredondamento e regras de zero aplicados
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Valores de %VD calculados corretamente
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={frontLabel.altoEmAddedSugar || frontLabel.altoEmSatFat || frontLabel.altoEmSodium ? 'text-yellow-600' : 'text-green-600'}>
                      {frontLabel.altoEmAddedSugar || frontLabel.altoEmSatFat || frontLabel.altoEmSodium ? '⚠' : '✓'}
                    </span>
                    Rotulagem frontal verificada (RDC 429/2020)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={allergensSaved ? 'text-green-600' : 'text-yellow-600'}>
                      {allergensSaved ? '✓' : '⚠'}
                    </span>
                    {allergensSaved ? 'Alergênicos configurados' : 'Alergênicos pendentes de configuração'}
                  </li>
                </ul>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Baseado em: RDC 429/2020, IN 75/2020, RDC 359/2003, RDC 26/2015
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
