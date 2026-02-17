import { useState, useEffect } from 'react';
import { Trash2, Eye, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NutritionResults } from '../lib/nutritionEngine';

interface Recipe {
  id: string;
  name: string;
  category: string;
  product_type: 'solid' | 'liquid';
  created_at: string;
  nutrition_data: NutritionResults;
}

interface RecipeDashboardProps {
  onSelectRecipe: (recipe: Recipe) => void;
}

export function RecipeDashboard({ onSelectRecipe }: RecipeDashboardProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('recipes')
        .select('id, name, category, product_type, created_at, nutrition_data')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError('Erro ao carregar receitas');
        console.error(fetchError);
        return;
      }

      setRecipes(data || []);
    } catch (err) {
      setError('Erro ao conectar ao banco de dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta receita?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        setError('Erro ao deletar receita');
        return;
      }

      setRecipes(recipes.filter(r => r.id !== id));
    } catch (err) {
      setError('Erro ao deletar receita');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Carregando receitas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Minhas Receitas</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {recipes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-4">Você ainda não criou nenhuma receita.</p>
            <p className="text-gray-500 text-sm">Clique em "Criar Rotulagem" para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => (
              <div key={recipe.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{recipe.name}</h3>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Categoria:</span> {recipe.category}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tipo:</span> {recipe.product_type === 'solid' ? 'Sólido' : 'Líquido'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(recipe.created_at).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectRecipe(recipe)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    Visualizar
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
