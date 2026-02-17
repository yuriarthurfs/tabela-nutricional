import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { ALLERGEN_DISPLAY_NAMES } from '../lib/allergenMapping';

interface AllergenManagerProps {
  inferredAllergens: string[];
  onSave: (contem: string[], podeConter: string[], manual: string) => void;
}

export function AllergenManager({ inferredAllergens, onSave }: AllergenManagerProps) {
  const [podeConter, setPodeConter] = useState<string[]>([]);
  const [manual, setManual] = useState('');
  const [selectedAllergen, setSelectedAllergen] = useState('');

  const handleAddPodeConter = () => {
    if (selectedAllergen && !podeConter.includes(selectedAllergen)) {
      setPodeConter([...podeConter, selectedAllergen]);
      setSelectedAllergen('');
    }
  };

  const handleRemovePodeConter = (allergen: string) => {
    setPodeConter(podeConter.filter(a => a !== allergen));
  };

  const handleSave = () => {
    onSave(inferredAllergens, podeConter, manual);
  };

  const availableAllergens = Object.keys(ALLERGEN_DISPLAY_NAMES).filter(
    a => !inferredAllergens.includes(a) && !podeConter.includes(a)
  );

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-semibold">Alergênicos (RDC 26/2015)</span>
        </div>
        <p className="text-sm text-blue-700">
          Gerenciar informações sobre alergênicos conforme regulamentação brasileira.
        </p>
      </div>

      <div>
        <h3 className="font-semibold mb-2">CONTÉM (detectado automaticamente):</h3>
        {inferredAllergens.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {inferredAllergens.map(allergen => (
              <span key={allergen} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {ALLERGEN_DISPLAY_NAMES[allergen]}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Nenhum alergênico detectado nos ingredientes</p>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2">PODE CONTER (contaminação cruzada):</h3>
        <div className="flex gap-2 mb-2">
          <select
            value={selectedAllergen}
            onChange={(e) => setSelectedAllergen(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um alergênico...</option>
            {availableAllergens.map(allergen => (
              <option key={allergen} value={allergen}>
                {ALLERGEN_DISPLAY_NAMES[allergen]}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddPodeConter}
            disabled={!selectedAllergen}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300"
          >
            Adicionar
          </button>
        </div>

        {podeConter.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {podeConter.map(allergen => (
              <span
                key={allergen}
                className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 cursor-pointer hover:bg-yellow-200"
                onClick={() => handleRemovePodeConter(allergen)}
              >
                {ALLERGEN_DISPLAY_NAMES[allergen]}
                <span className="ml-1">×</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Justificativa/Observações Internas (obrigatório para "PODE CONTER")
        </label>
        <textarea
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="Ex: Produzido em linha compartilhada com produtos que contêm..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required={podeConter.length > 0}
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
      >
        Salvar Alergênicos
      </button>

      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Frase para Rótulo:</h3>
        {inferredAllergens.length > 0 && (
          <p className="text-sm mb-2">
            <strong>ALÉRGICOS: CONTÉM {inferredAllergens.map(a => ALLERGEN_DISPLAY_NAMES[a]).join(', ')}.</strong>
          </p>
        )}
        {podeConter.length > 0 && (
          <p className="text-sm">
            <strong>ALÉRGICOS: PODE CONTER {podeConter.map(a => ALLERGEN_DISPLAY_NAMES[a]).join(', ')}.</strong>
          </p>
        )}
      </div>
    </div>
  );
}
