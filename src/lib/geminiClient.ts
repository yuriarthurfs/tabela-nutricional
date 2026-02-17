const GEMINI_API_KEY = 'AIzaSyBovOfN5OM8H5pk7raMSZezzxLRfxgchOo';
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

async function callGemini(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 50,
        }
      }),
    });

  if (!response.ok) {
    const errBody = await response.text();
    console.error("Gemini error:", response.status, errBody);
    return "0";
  }


    const data: GeminiResponse = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text || '0';

    const numberMatch = text.match(/\d+\.?\d*/);
    return numberMatch ? numberMatch[0] : '0';
  } catch (error) {
    console.error('Erro ao chamar Gemini:', error);
    return '0';
  }
}

export async function detectAddedSugars(ingredientName: string, quantityG: number): Promise<number> {
  const prompt = `Quantos gramas de açúcares adicionados (açúcar refinado, mel, xarope, etc.) existem em ${quantityG}g de ${ingredientName}?
Responda APENAS com o número (sem unidade, sem texto adicional).
Exemplos:
- 100g de achocolatado em pó: 20
- 50g de açúcar refinado: 50
- 100g de arroz: 0
- 200g de refrigerante de cola: 22
- 100g de bolacha recheada: 25`;

  const result = await callGemini(prompt);
  const parsed = parseFloat(result);
  return isNaN(parsed) ? 0 : parsed;
}

export async function detectTotalSugars(ingredientName: string, quantityG: number): Promise<number> {
  const prompt = `Quantos gramas de açúcares totais (incluindo açúcares naturais e adicionados) existem em ${quantityG}g de ${ingredientName}?
Responda APENAS com o número (sem unidade, sem texto adicional).
Exemplos:
- 100g de banana: 12
- 50g de açúcar refinado: 50
- 100g de arroz cozido: 0
- 200g de leite integral: 10`;

  const result = await callGemini(prompt);
  const parsed = parseFloat(result);
  return isNaN(parsed) ? 0 : parsed;
}

export const geminiClient = {
  detectAddedSugars,
  detectTotalSugars,
};
