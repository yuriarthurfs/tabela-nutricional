import { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { tacoClient, TacoFood } from '../lib/tacoClient';

interface Ingredient {
  id: string;
  name: string;
  quantityG: number;
  nutrients: TacoFood['nutrients'];
}

interface IngredientSearchProps {
  ingredients: Ingredient[];
  onAddIngredient: (ingredient: Ingredient) => void;
  onRemoveIngredient: (id: string) => void;
}

export function IngredientSearch({ ingredients, onAddIngredient, onRemoveIngredient }: IngredientSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TacoFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<TacoFood | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        const results = await tacoClient.searchFoods(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleAddIngredient = () => {
    if (!selectedFood || quantity <= 0) return;

    onAddIngredient({
      id: `${selectedFood.numero_alimento}-${Date.now()}`,
      name: selectedFood.descricao,
      quantityG: quantity,
      nutrients: selectedFood.nutrients,
    });

    setSelectedFood(null);
    setQuantity(100);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar ingrediente na base TACO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((food) => (
              <button
                key={food.id}
                onClick={() => {
                  setSelectedFood(food);
                  setSearchQuery(food.descricao);
                  setSearchResults([]);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition"
              >
                <div className="text-sm font-medium">{food.descricao}</div>
                <div className="text-xs text-gray-500">{food.categoria}</div>
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
            Buscando...
          </div>
        )}
      </div>

      {selectedFood && (
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              placeholder="Quantidade (g)"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleAddIngredient}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar
          </button>
        </div>
      )}

      <div className="space-y-2">
        {ingredients.map((ing) => (
          <div key={ing.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div>
              <span className="font-medium">{ing.name}</span>
              <span className="text-gray-600 ml-2">({ing.quantityG}g)</span>
            </div>
            <button
              onClick={() => onRemoveIngredient(ing.id)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { Ingredient };
