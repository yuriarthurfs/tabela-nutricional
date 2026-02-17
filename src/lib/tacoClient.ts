import { supabase } from './supabase';

export interface NutrientData {
  energia_kcal: number;
  energia_kj: number;
  proteina_g: number;
  lipidios_g: number;
  carboidratos_g: number;
  fibra_g: number;
  sodio_mg: number;
  calcio_mg: number;
  magnesio_mg: number;
  fosforo_mg: number;
  ferro_mg: number;
  potassio_mg: number;
  cobre_mg: number;
  zinco_mg: number;
  manganio_mg: number;
  colesterol_mg: number;
  retinol_mcg: number;
  vitamina_c_mg: number;
  tiamina_mg: number;
  riboflavina_mg: number;
  piridoxina_mg: number;
  niacina_mg: number;
  gorduras_saturadas_g: number;
  gorduras_monoinsaturadas_g: number;
  gorduras_poliinsaturadas_g: number;
  gorduras_trans_g: number;
  acucares_adicionados_g: number;
}

export interface TacoFood {
  id: string;
  numero_alimento: string;
  categoria: string;
  descricao: string;
  nutrients: NutrientData;
}

function parseNumber(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = parseFloat(String(value).replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
}

async function getAcidosGraxos(numeroAlimento: string): Promise<Partial<NutrientData>> {
  try {
    const { data } = await supabase
      .from('acidos_graxos')
      .select('*')
      .eq('Número do Alimento', numeroAlimento)
      .maybeSingle();

    if (!data) return {
      gorduras_saturadas_g: 0,
      gorduras_monoinsaturadas_g: 0,
      gorduras_poliinsaturadas_g: 0,
      gorduras_trans_g: 0,
    };

    return {
      gorduras_saturadas_g: parseNumber(data['Saturados..g.']),
      gorduras_monoinsaturadas_g: parseNumber(data['Mono.insaturados..g.']),
      gorduras_poliinsaturadas_g: parseNumber(data['Poli.insaturados..g.']),
      gorduras_trans_g: (parseNumber(data['X18.1t..g.']) + parseNumber(data['X18.2t..g.'])) / 100,
    };
  } catch {
    return {
      gorduras_saturadas_g: 0,
      gorduras_monoinsaturadas_g: 0,
      gorduras_poliinsaturadas_g: 0,
      gorduras_trans_g: 0,
    };
  }
}


export async function searchFoods(query: string): Promise<TacoFood[]> {
  try {
    const { data } = await supabase
      .from('tabela_taco')
      .select('*')
      .or(
        `Descrição dos alimentos.ilike.%${query}%,Categoria do alimento.ilike.%${query}%`
      )
      .limit(20);

    if (!data) return [];

    return (data || []).map((item: any, index: number) => ({
      id: `${item['Número do Alimento']}-${index}`,
      numero_alimento: item['Número do Alimento'],
      categoria: item['Categoria do alimento'],
      descricao: item['Descrição dos alimentos'],
      nutrients: {
        energia_kcal: parseNumber(item['Energia..kcal.']),
        energia_kj: parseNumber(item['Energia..kJ.']),
        proteina_g: parseNumber(item['Proteína..g.']),
        lipidios_g: parseNumber(item['Lipídeos..g.']),
        carboidratos_g: parseNumber(item['Carboidrato..g.']),
        fibra_g: parseNumber(item['Fibra.Alimentar..g.']),
        sodio_mg: parseNumber(item['Sódio..mg.']),
        calcio_mg: parseNumber(item['Cálcio..mg.']),
        magnesio_mg: parseNumber(item['Magnésio..mg.']),
        fosforo_mg: parseNumber(item['Fósforo..mg.']),
        ferro_mg: parseNumber(item['Ferro..mg.']),
        potassio_mg: parseNumber(item['Potássio..mg.']),
        cobre_mg: parseNumber(item['Cobre..mg.']),
        zinco_mg: parseNumber(item['Zinco..mg.']),
        manganio_mg: parseNumber(item['Manganês..mg.']),
        colesterol_mg: parseNumber(item['Colesterol..mg.']),
        retinol_mcg: parseNumber(item['Retinol..mcg.']),
        vitamina_c_mg: parseNumber(item['Vitamina.C..mg.']),
        tiamina_mg: parseNumber(item['Tiamina..mg.']),
        riboflavina_mg: parseNumber(item['Riboflavina..mg.']),
        piridoxina_mg: parseNumber(item['Piridoxina..mg.']),
        niacina_mg: parseNumber(item['Niacina..mg.']),
        gorduras_saturadas_g: 0,
        gorduras_monoinsaturadas_g: 0,
        gorduras_poliinsaturadas_g: 0,
        gorduras_trans_g: 0,
        acucares_adicionados_g: 0,
      },
    }));
  } catch (err) {
    console.error('Erro ao buscar alimentos:', err);
    return [];
  }
}

export async function getFoodById(numeroAlimento: string): Promise<TacoFood | null> {
  try {
    const { data } = await supabase
      .from('tabela_taco')
      .select('*')
      .eq('Número do Alimento', numeroAlimento)
      .maybeSingle();

    if (!data) return null;

    const acidosGraxos = await getAcidosGraxos(numeroAlimento);

    const nutrients: NutrientData = {
      energia_kcal: parseNumber(data['Energia..kcal.']),
      energia_kj: parseNumber(data['Energia..kJ.']),
      proteina_g: parseNumber(data['Proteína..g.']),
      lipidios_g: parseNumber(data['Lipídeos..g.']),
      carboidratos_g: parseNumber(data['Carboidrato..g.']),
      fibra_g: parseNumber(data['Fibra.Alimentar..g.']),
      sodio_mg: parseNumber(data['Sódio..mg.']),
      calcio_mg: parseNumber(data['Cálcio..mg.']),
      magnesio_mg: parseNumber(data['Magnésio..mg.']),
      fosforo_mg: parseNumber(data['Fósforo..mg.']),
      ferro_mg: parseNumber(data['Ferro..mg.']),
      potassio_mg: parseNumber(data['Potássio..mg.']),
      cobre_mg: parseNumber(data['Cobre..mg.']),
      zinco_mg: parseNumber(data['Zinco..mg.']),
      manganio_mg: parseNumber(data['Manganês..mg.']),
      colesterol_mg: parseNumber(data['Colesterol..mg.']),
      retinol_mcg: parseNumber(data['Retinol..mcg.']),
      vitamina_c_mg: parseNumber(data['Vitamina.C..mg.']),
      tiamina_mg: parseNumber(data['Tiamina..mg.']),
      riboflavina_mg: parseNumber(data['Riboflavina..mg.']),
      piridoxina_mg: parseNumber(data['Piridoxina..mg.']),
      niacina_mg: parseNumber(data['Niacina..mg.']),
      gorduras_saturadas_g: acidosGraxos.gorduras_saturadas_g || 0,
      gorduras_monoinsaturadas_g: acidosGraxos.gorduras_monoinsaturadas_g || 0,
      gorduras_poliinsaturadas_g: acidosGraxos.gorduras_poliinsaturadas_g || 0,
      gorduras_trans_g: acidosGraxos.gorduras_trans_g || 0,
      acucares_adicionados_g: 0,
    };

    return {
      id: numeroAlimento,
      numero_alimento: numeroAlimento,
      categoria: data['Categoria do alimento'],
      descricao: data['Descrição dos alimentos'],
      nutrients,
    };
  } catch (err) {
    console.error('Erro ao buscar alimento por ID:', err);
    return null;
  }
}

export async function getAllFoods(): Promise<TacoFood[]> {
  try {
    const { data } = await supabase
      .from('tabela_taco')
      .select('*')
      .limit(500);

    if (!data) return [];

    return (data || []).map((item: any, index: number) => ({
      id: `${item['Número do Alimento']}-${index}`,
      numero_alimento: item['Número do Alimento'],
      categoria: item['Categoria do alimento'],
      descricao: item['Descrição dos alimentos'],
      nutrients: {
        energia_kcal: parseNumber(item['Energia..kcal.']),
        energia_kj: parseNumber(item['Energia..kJ.']),
        proteina_g: parseNumber(item['Proteína..g.']),
        lipidios_g: parseNumber(item['Lipídeos..g.']),
        carboidratos_g: parseNumber(item['Carboidrato..g.']),
        fibra_g: parseNumber(item['Fibra.Alimentar..g.']),
        sodio_mg: parseNumber(item['Sódio..mg.']),
        calcio_mg: parseNumber(item['Cálcio..mg.']),
        magnesio_mg: parseNumber(item['Magnésio..mg.']),
        fosforo_mg: parseNumber(item['Fósforo..mg.']),
        ferro_mg: parseNumber(item['Ferro..mg.']),
        potassio_mg: parseNumber(item['Potássio..mg.']),
        cobre_mg: parseNumber(item['Cobre..mg.']),
        zinco_mg: parseNumber(item['Zinco..mg.']),
        manganio_mg: parseNumber(item['Manganês..mg.']),
        colesterol_mg: parseNumber(item['Colesterol..mg.']),
        retinol_mcg: parseNumber(item['Retinol..mcg.']),
        vitamina_c_mg: parseNumber(item['Vitamina.C..mg.']),
        tiamina_mg: parseNumber(item['Tiamina..mg.']),
        riboflavina_mg: parseNumber(item['Riboflavina..mg.']),
        piridoxina_mg: parseNumber(item['Piridoxina..mg.']),
        niacina_mg: parseNumber(item['Niacina..mg.']),
        gorduras_saturadas_g: 0,
        gorduras_monoinsaturadas_g: 0,
        gorduras_poliinsaturadas_g: 0,
        gorduras_trans_g: 0,
        acucares_adicionados_g: 0,
      },
    }));
  } catch (err) {
    console.error('Erro ao buscar todos os alimentos:', err);
    return [];
  }
}

export const tacoClient = {
  searchFoods,
  getFoodById,
  getAllFoods,
};
