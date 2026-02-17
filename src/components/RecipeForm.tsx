import { useState } from 'react';
import { PORTION_CATEGORIES } from '../lib/nutritionEngine';

interface RecipeFormData {
  name: string;
  category: string;
  productType: 'solid' | 'liquid';
  finalYieldG: number;
  portionG: number;
  householdMeasure: string;
  numPortions: number;
}

interface RecipeFormProps {
  onSubmit: (data: RecipeFormData) => void;
  initialData?: Partial<RecipeFormData>;
}

export function RecipeForm({ onSubmit, initialData }: RecipeFormProps) {
  const [formData, setFormData] = useState<RecipeFormData>({
    name: initialData?.name || '',
    category: initialData?.category || 'paes',
    productType: initialData?.productType || 'solid',
    finalYieldG: initialData?.finalYieldG || 0,
    portionG: initialData?.portionG || PORTION_CATEGORIES.paes.portion,
    householdMeasure: initialData?.householdMeasure || PORTION_CATEGORIES.paes.measure,
    numPortions: initialData?.numPortions || 1,
  });

  const handleCategoryChange = (category: string) => {
    const categoryData = PORTION_CATEGORIES[category as keyof typeof PORTION_CATEGORIES];
    setFormData({
      ...formData,
      category,
      portionG: categoryData.portion,
      householdMeasure: categoryData.measure,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nome do Produto</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Categoria</label>
          <select
            value={formData.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(PORTION_CATEGORIES).map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Produto</label>
          <select
            value={formData.productType}
            onChange={(e) => setFormData({ ...formData, productType: e.target.value as 'solid' | 'liquid' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="solid">Sólido/Semissólido</option>
            <option value="liquid">Líquido</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Rendimento Final (g/ml)</label>
          <input
            type="number"
            step="0.1"
            value={formData.finalYieldG || ''}
            onChange={(e) => setFormData({ ...formData, finalYieldG: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Número de Porções</label>
          <input
            type="number"
            value={formData.numPortions || ''}
            onChange={(e) => setFormData({ ...formData, numPortions: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tamanho da Porção (g/ml)</label>
          <input
            type="number"
            step="0.1"
            value={formData.portionG || ''}
            onChange={(e) => setFormData({ ...formData, portionG: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Medida Caseira</label>
          <input
            type="text"
            value={formData.householdMeasure}
            onChange={(e) => setFormData({ ...formData, householdMeasure: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
      >
        Continuar
      </button>
    </form>
  );
}
