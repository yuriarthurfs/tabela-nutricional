export const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  gluten: ['trigo', 'centeio', 'cevada', 'aveia', 'farinha de trigo', 'farinha de centeio'],
  trigo: ['trigo', 'farinha de trigo'],
  crustaceos: ['camarão', 'lagosta', 'caranguejo', 'siri'],
  ovos: ['ovo', 'ovos', 'clara', 'gema', 'albumina'],
  peixes: ['peixe', 'atum', 'sardinha', 'bacalhau', 'salmão'],
  amendoim: ['amendoim', 'pasta de amendoim'],
  soja: ['soja', 'lecitina de soja', 'proteína de soja', 'óleo de soja'],
  leite: ['leite', 'queijo', 'iogurte', 'manteiga', 'creme de leite', 'lactose', 'mussarela', 'parmesão'],
  frutos_casca: ['castanha', 'noz', 'amêndoa', 'avelã', 'pistache', 'macadâmia'],
  sulfitos: ['sulfito', 'metabissulfito'],
};

export function inferAllergens(ingredientNames: string[]): string[] {
  const allergens = new Set<string>();

  for (const ingredient of ingredientNames) {
    const normalizedIngredient = ingredient.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    for (const [allergen, keywords] of Object.entries(ALLERGEN_KEYWORDS)) {
      for (const keyword of keywords) {
        const normalizedKeyword = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normalizedIngredient.includes(normalizedKeyword)) {
          allergens.add(allergen);
          break;
        }
      }
    }
  }

  return Array.from(allergens);
}

export const ALLERGEN_DISPLAY_NAMES: Record<string, string> = {
  gluten: 'GLÚTEN',
  trigo: 'TRIGO',
  crustaceos: 'CRUSTÁCEOS',
  ovos: 'OVOS',
  peixes: 'PEIXES',
  amendoim: 'AMENDOIM',
  soja: 'SOJA',
  leite: 'LEITE',
  frutos_casca: 'FRUTOS DE CASCA RIJA',
  sulfitos: 'SULFITOS',
};
