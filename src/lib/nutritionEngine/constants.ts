export const VDR_TABLE = {
  energyKcal: 2000,
  energyKj: 8400,
  carbohydrates: 300,
  addedSugars: 50,
  proteins: 50,
  totalFat: 65,
  saturatedFat: 20,
  transFat: 2,
  fiber: 25,
  sodium: 2000,
};

export const ZERO_LIMITS = {
  energyKcal: 4,
  carbohydrates: 0.5,
  proteins: 0.5,
  totalFat: 0.5,
  saturatedFat: 0.2,
  transFat: 0.2,
  fiber: 0.5,
  sodium: 5,
};

export const FRONT_LABEL_LIMITS = {
  solid: {
    addedSugars: 15,
    saturatedFat: 6,
    sodium: 600,
  },
  liquid: {
    addedSugars: 7.5,
    saturatedFat: 3,
    sodium: 300,
  },
};

export const ALLERGEN_LIST = [
  'gluten',
  'crustaceos',
  'ovos',
  'peixes',
  'amendoim',
  'soja',
  'leite',
  'frutos_casca',
  'sulfitos',
  'trigo',
  'centeio',
  'cevada',
  'aveia',
];

export const PORTION_CATEGORIES = {
  paes: { portion: 50, measure: '1 fatia' },
  biscoitos: { portion: 30, measure: '3 unidades' },
  cereais: { portion: 30, measure: '2 colheres de sopa' },
  massas: { portion: 80, measure: '1 concha' },
  arroz: { portion: 160, measure: '4 colheres de sopa' },
  feijao: { portion: 160, measure: '1 concha' },
  carnes: { portion: 100, measure: '1 bife médio' },
  leite: { portion: 200, measure: '1 copo' },
  iogurte: { portion: 200, measure: '1 pote' },
  queijos: { portion: 30, measure: '2 fatias' },
  frutas: { portion: 100, measure: '1 unidade' },
  vegetais: { portion: 100, measure: '3 colheres de sopa' },
  sucos: { portion: 200, measure: '1 copo' },
  refrigerantes: { portion: 200, measure: '1 copo' },
  sobremesas: { portion: 60, measure: '1 fatia pequena' },
  sorvetes: { portion: 60, measure: '1 bola' },
  chocolate: { portion: 25, measure: '5 quadradinhos' },
  salgadinhos: { portion: 30, measure: '1 xícara' },
  molhos: { portion: 15, measure: '1 colher de sopa' },
  oleos: { portion: 13, measure: '1 colher de sopa' },
};
