import { NutritionResults } from '../lib/nutritionEngine';

interface NutritionTableProps {
  results: NutritionResults;
  portionG: number;
  householdMeasure: string;
  productType: 'solid' | 'liquid';
}

export function NutritionTable({ results, portionG, householdMeasure, productType }: NutritionTableProps) {
  const { displayValues, vdPercent } = results;

  const formatVD = (value: number | undefined) => {
    if (value === undefined) return '**';
    return Math.round(value).toString();
  };

  const unit = productType === 'solid' ? 'g' : 'ml';

  return (
    <div className="bg-white border-2 border-black" style={{ maxWidth: '400px' }}>
      <div className="bg-black text-white p-2 text-center font-bold">
        INFORMAÇÃO NUTRICIONAL
      </div>

      <div className="p-3 border-b-2 border-black">
        <div className="text-sm">
          Porção de {portionG}{unit} ({householdMeasure})
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left p-2 font-bold">Quantidade por porção</th>
            <th className="text-right p-2 font-bold">%VD(*)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-400">
            <td className="p-2">
              <strong>Valor energético</strong>
            </td>
            <td className="text-right p-2">
              <div>{displayValues.perPortion.energyKcal} kcal = {displayValues.perPortion.energyKj} kJ</div>
            </td>
            <td className="text-right p-2 font-bold">{formatVD(vdPercent.energyKcal)}%</td>
          </tr>

          <tr className="border-b border-gray-400">
            <td className="p-2">Carboidratos</td>
            <td className="text-right p-2">{displayValues.perPortion.carbohydrates} g</td>
            <td className="text-right p-2 font-bold">{formatVD(vdPercent.carbohydrates)}%</td>
          </tr>

          <tr className="border-b border-gray-400 bg-gray-50">
            <td className="p-2 pl-6">Açúcares totais</td>
            <td className="text-right p-2">{displayValues.perPortion.totalSugars} g</td>
            <td className="text-right p-2">**</td>
          </tr>

          <tr className="border-b border-gray-400 bg-gray-50">
            <td className="p-2 pl-6">Açúcares adicionados</td>
            <td className="text-right p-2">{displayValues.perPortion.addedSugars} g</td>
            <td className="text-right p-2 font-bold">{formatVD(vdPercent.addedSugars)}%</td>
          </tr>

          <tr className="border-b border-gray-400">
            <td className="p-2">Proteínas</td>
            <td className="text-right p-2">{displayValues.perPortion.proteins} g</td>
            <td className="text-right p-2 font-bold">{formatVD(vdPercent.proteins)}%</td>
          </tr>

          <tr className="border-b border-gray-400">
            <td className="p-2">Gorduras totais</td>
            <td className="text-right p-2">{displayValues.perPortion.totalFat} g</td>
            <td className="text-right p-2 font-bold">{formatVD(vdPercent.totalFat)}%</td>
          </tr>

          <tr className="border-b border-gray-400 bg-gray-50">
            <td className="p-2 pl-6">Gorduras saturadas</td>
            <td className="text-right p-2">{displayValues.perPortion.saturatedFat} g</td>
            <td className="text-right p-2 font-bold">{formatVD(vdPercent.saturatedFat)}%</td>
          </tr>

          <tr className="border-b border-gray-400 bg-gray-50">
            <td className="p-2 pl-6">Gorduras trans</td>
            <td className="text-right p-2">{displayValues.perPortion.transFat} g</td>
            <td className="text-right p-2 font-bold">{formatVD(vdPercent.transFat)}%</td>
          </tr>

          <tr className="border-b border-gray-400">
            <td className="p-2">Fibra alimentar</td>
            <td className="text-right p-2">{displayValues.perPortion.fiber} g</td>
            <td className="text-right p-2 font-bold">{formatVD(vdPercent.fiber)}%</td>
          </tr>

          <tr className="border-b-2 border-black">
            <td className="p-2">Sódio</td>
            <td className="text-right p-2">{displayValues.perPortion.sodium} mg</td>
            <td className="text-right p-2 font-bold">{formatVD(vdPercent.sodium)}%</td>
          </tr>
        </tbody>
      </table>

      <div className="p-3 text-xs border-t border-gray-400">
        (*) % Valores Diários de referência com base em uma dieta de 2.000 kcal ou 8.400 kJ.
        Seus valores diários podem ser maiores ou menores dependendo de suas necessidades energéticas.
        (**) VD não estabelecido.
      </div>

      <div className="p-3 bg-gray-50 border-t-2 border-black">
        <div className="font-bold mb-2">Valores por 100{unit}:</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Energia: {displayValues.per100g.energyKcal} kcal</div>
          <div>Carboidratos: {displayValues.per100g.carbohydrates} g</div>
          <div>Proteínas: {displayValues.per100g.proteins} g</div>
          <div>Gorduras totais: {displayValues.per100g.totalFat} g</div>
          <div>Gorduras saturadas: {displayValues.per100g.saturatedFat} g</div>
          <div>Sódio: {displayValues.per100g.sodium} mg</div>
        </div>
      </div>
    </div>
  );
}
