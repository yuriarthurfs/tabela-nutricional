import { FrontLabelResult } from '../lib/nutritionEngine';
import { AlertTriangle } from 'lucide-react';

interface FrontLabelProps {
  frontLabel: FrontLabelResult;
}

export function FrontLabel({ frontLabel }: FrontLabelProps) {
  const hasWarnings = frontLabel.altoEmAddedSugar || frontLabel.altoEmSatFat || frontLabel.altoEmSodium;

  if (!hasWarnings) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">Produto NÃO requer rotulagem frontal (lupa)</span>
        </div>
        <p className="text-sm text-green-700 mt-2">
          O produto não atinge os limites regulatórios para açúcares adicionados, gorduras saturadas ou sódio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">Rotulagem Frontal Obrigatória</span>
        </div>
        <p className="text-sm text-red-700">
          Este produto deve exibir o símbolo de lupa "ALTO EM" na parte frontal da embalagem conforme RDC 429/2020.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        {frontLabel.altoEmAddedSugar && (
          <div className="flex-1 min-w-[200px]">
            <div className="bg-black text-white p-4 rounded-lg text-center">
              <div className="text-4xl mb-2">🔍</div>
              <div className="font-bold text-lg">ALTO EM</div>
              <div className="font-bold text-lg">AÇÚCARES</div>
              <div className="font-bold text-lg">ADICIONADOS</div>
            </div>
          </div>
        )}

        {frontLabel.altoEmSatFat && (
          <div className="flex-1 min-w-[200px]">
            <div className="bg-black text-white p-4 rounded-lg text-center">
              <div className="text-4xl mb-2">🔍</div>
              <div className="font-bold text-lg">ALTO EM</div>
              <div className="font-bold text-lg">GORDURAS</div>
              <div className="font-bold text-lg">SATURADAS</div>
            </div>
          </div>
        )}

        {frontLabel.altoEmSodium && (
          <div className="flex-1 min-w-[200px]">
            <div className="bg-black text-white p-4 rounded-lg text-center">
              <div className="text-4xl mb-2">🔍</div>
              <div className="font-bold text-lg">ALTO EM</div>
              <div className="font-bold text-lg">SÓDIO</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
