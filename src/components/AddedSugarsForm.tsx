import { useState, useEffect } from 'react';
import { Ingredient } from './IngredientSearch';
import { geminiClient } from '../lib/geminiClient';

interface AddedSugarsFormProps {
  ingredients: Ingredient[];
  onSubmit: (addedSugarsG: number) => void;
}

export function AddedSugarsForm({ ingredients, onSubmit }: AddedSugarsFormProps) {
  const [addedSugars, setAddedSugars] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [ingredientDetails, setIngredientDetails] = useState<Array<{
    name: string;
    quantityG: number;
    addedSugarsG: number;
  }>>([]);

  useEffect(() => {
    const calculateAddedSugars = async () => {
      if (ingredients.length === 0) {
        setAddedSugars(0);
        setIngredientDetails([]);
        return;
      }

      setIsCalculating(true);

      try {
        const results = await Promise.all(
          ingredients.map(async (ingredient) => {
            const addedSugarsG = await geminiClient.detectAddedSugars(
              ingredient.name,
              ingredient.quantityG
            );

            return {
              name: ingredient.name,
              quantityG: ingredient.quantityG,
              addedSugarsG,
            };
          })
        );

        setIngredientDetails(results);

        const total = results.reduce((sum, item) => sum + item.addedSugarsG, 0);
        setAddedSugars(Math.round(total * 10) / 10);
      } catch (error) {
        console.error('Erro ao calcular açúcares adicionados:', error);
        setAddedSugars(0);
        setIngredientDetails([]);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateAddedSugars();
  }, [ingredients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(addedSugars);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Açúcares Adicionados</h3>
        <p className="text-sm text-blue-700 mb-2">
          O sistema detecta automaticamente açúcares adicionados usando inteligência artificial (Gemini).
          Você pode ajustar o valor se necessário.
        </p>
      </div>

      {isCalculating && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-sm text-yellow-800">Calculando açúcares adicionados com IA...</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          Quantidade Total de Açúcares Adicionados (g)
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.1"
            value={addedSugars || ''}
            onChange={(e) => setAddedSugars(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            disabled={isCalculating}
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">g</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Detectado automaticamente com IA. Ajuste se necessário.
        </p>
      </div>

      {ingredientDetails.length > 0 && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm">
          <p className="font-medium mb-2">Açúcares adicionados detectados por ingrediente:</p>
          <ul className="space-y-1">
            {ingredientDetails.map((detail, index) => (
              <li key={index} className="text-gray-700">
                {detail.name} ({detail.quantityG}g): {detail.addedSugarsG.toFixed(1)}g
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        disabled={isCalculating}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isCalculating ? 'Calculando...' : 'Calcular Valores Nutricionais'}
      </button>
    </form>
  );
}
