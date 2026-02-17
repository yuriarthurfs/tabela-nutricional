import { useState, useEffect } from 'react';
import { Ingredient } from './IngredientSearch';

interface AddedSugarsFormProps {
  ingredients: Ingredient[];
  onSubmit: (addedSugarsG: number) => void;
}

export function AddedSugarsForm({ ingredients, onSubmit }: AddedSugarsFormProps) {
  const [addedSugars, setAddedSugars] = useState<number>(0);

  useEffect(() => {
    const totalAddedSugars = ingredients.reduce((sum, ingredient) => {
      return sum + (ingredient.nutrients.acucares_adicionados_g || 0) * (ingredient.quantityG / 100);
    }, 0);

    setAddedSugars(Math.round(totalAddedSugars * 10) / 10);
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
          O sistema detecta automaticamente açúcares adicionados presentes nos ingredientes.
          Você pode ajustar o valor se necessário.
        </p>
      </div>

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
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">g</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Detectado automaticamente dos ingredientes. Ajuste se necessário.
        </p>
      </div>

      {ingredients.filter(ing => ing.nutrients.acucares_adicionados_g > 0).length > 0 && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm">
          <p className="font-medium mb-2">Açúcares adicionados detectados:</p>
          <ul className="space-y-1">
            {ingredients
              .filter(ing => ing.nutrients.acucares_adicionados_g > 0)
              .map(ing => (
                <li key={ing.id} className="text-gray-700">
                  {ing.name}: {((ing.nutrients.acucares_adicionados_g * ing.quantityG) / 100).toFixed(1)}g
                </li>
              ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
      >
        Calcular Valores Nutricionais
      </button>
    </form>
  );
}
