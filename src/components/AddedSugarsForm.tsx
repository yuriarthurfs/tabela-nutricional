import { useState, useEffect } from 'react';
import { Ingredient } from './IngredientSearch';
import { geminiClient } from '../lib/geminiClient';

interface AddedSugarsFormProps {
  ingredients: Ingredient[];
  onSubmit: (addedSugarsG: number) => void;
}

// --- helpers ---
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Detecta açúcares "puros" onde:
 * - açúcar adicionado = quantidade em gramas
 * - (e, por regra de negócio, açúcar total também seria igual, mas aqui só calculamos "addedSugars")
 */
const isPureSugar = (name: string) => {
  const n = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // remove acentos

  // cobre variações comuns e descrições compostas (ex.: "açucar cristal organico")
  const hasAcucar = n.includes('acucar');
  const hasType =
    n.includes('refinado') || n.includes('cristal') || n.includes('mascavo');

  return hasAcucar && hasType;
};

/**
 * Extrai retryDelay de erros 429 no formato do Gemini (ex.: "58s"),
 * com fallback caso não exista.
 */
const getRetryDelayMsFromGemini429 = (err: unknown, fallbackMs: number) => {
  try {
    const anyErr = err as any;
    const details = anyErr?.error?.details ?? anyErr?.details ?? [];
    const retryInfo = Array.isArray(details)
      ? details.find((d) => d?.['@type']?.includes('RetryInfo'))
      : null;

    const retryDelay = retryInfo?.retryDelay; // "58s"
    if (typeof retryDelay === 'string') {
      const match = retryDelay.match(/^(\d+(?:\.\d+)?)s$/i);
      if (match?.[1]) {
        const seconds = Number(match[1]);
        if (Number.isFinite(seconds) && seconds >= 0) {
          // adiciona uma folga pequena pra evitar bater “na risca”
          return Math.ceil(seconds * 1000 + 250);
        }
      }
    }
  } catch {
    // ignore
  }
  return fallbackMs;
};

/**
 * Executa uma função com backoff simples para 429.
 * - Tenta 1x
 * - Se 429, espera retryDelay (se vier) ou fallback, e tenta mais 1x
 * - Se falhar de novo, propaga o erro
 */
const withGeminiRateLimitRetry = async <T,>(
  fn: () => Promise<T>,
  opts?: { fallbackDelayMs?: number; maxRetries?: number }
): Promise<T> => {
  const fallbackDelayMs = opts?.fallbackDelayMs ?? 60_000;
  const maxRetries = opts?.maxRetries ?? 1;

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      const status =
        err?.status ??
        err?.error?.status ??
        err?.error?.code ??
        err?.code;

      const is429 =
        status === 429 ||
        err?.error?.code === 429 ||
        err?.error?.status === 'RESOURCE_EXHAUSTED';

      if (!is429 || attempt >= maxRetries) throw err;

      const delayMs = getRetryDelayMsFromGemini429(err, fallbackDelayMs);
      await sleep(delayMs);
      attempt += 1;
    }
  }
};

export function AddedSugarsForm({ ingredients, onSubmit }: AddedSugarsFormProps) {
  const [addedSugars, setAddedSugars] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [ingredientDetails, setIngredientDetails] = useState<
    Array<{
      name: string;
      quantityG: number;
      addedSugarsG: number;
    }>
  >([]);

  useEffect(() => {
    let cancelled = false;

    const calculateAddedSugars = async () => {
      if (ingredients.length === 0) {
        setAddedSugars(0);
        setIngredientDetails([]);
        return;
      }

      setIsCalculating(true);

      try {
        // IMPORTANTE: evitar estourar limite de rate (5/min) => NÃO usar Promise.all aqui.
        // Fazemos em sequência, com um "sleep" entre chamadas.
        const results: Array<{
          name: string;
          quantityG: number;
          addedSugarsG: number;
        }> = [];

        for (let i = 0; i < ingredients.length; i++) {
          const ingredient = ingredients[i];

          // Regra nova: açúcares puros => addedSugars = quantityG (sem Gemini)
          let addedSugarsG: number;

          if (isPureSugar(ingredient.name)) {
            addedSugarsG = ingredient.quantityG;
          } else {
            // Chamada ao Gemini com retry se 429
            addedSugarsG = await withGeminiRateLimitRetry(
              () =>
                geminiClient.detectAddedSugars(
                  ingredient.name,
                  ingredient.quantityG
                ),
              {
                fallbackDelayMs: 60_000, // se não vier retryDelay, espera 60s
                maxRetries: 1, // tenta mais 1 vez após 429
              }
            );

            // Sleep FIXO entre chamadas para reduzir chance de 429.
            // Se seu limite é 5/min, um intervalo seguro seria ~12s por requisição.
            // Ajuste conforme seu plano.
            await sleep(12_000);
          }

          results.push({
            name: ingredient.name,
            quantityG: ingredient.quantityG,
            addedSugarsG,
          });

          if (cancelled) return;
        }

        if (cancelled) return;

        setIngredientDetails(results);

        const total = results.reduce((sum, item) => sum + item.addedSugarsG, 0);
        setAddedSugars(Math.round(total * 10) / 10);
      } catch (error) {
        console.error('Erro ao calcular açúcares adicionados:', error);
        if (!cancelled) {
          setAddedSugars(0);
          setIngredientDetails([]);
        }
      } finally {
        if (!cancelled) setIsCalculating(false);
      }
    };

    calculateAddedSugars();

    return () => {
      cancelled = true;
    };
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
        <p className="text-xs text-blue-700">
          Regra especial: açúcar refinado/cristal/mascavo = 100% do peso em gramas como açúcar adicionado.
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
