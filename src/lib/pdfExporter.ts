import { NutritionResults } from './nutritionEngine';
import { FrontLabelResult } from './nutritionEngine';

interface ExportData {
  recipeName: string;
  category: string;
  productType: string;
  portionG: number;
  householdMeasure: string;
  numPortions: number;
  finalYieldG: number;
  ingredients: Array<{
    name: string;
    quantityG: number;
  }>;
  nutritionResults: NutritionResults;
  frontLabel: FrontLabelResult;
  allergens: {
    contem: string[];
    podeConter: string[];
  };
}

export async function exportToPDF(data: ExportData): Promise<void> {
  const element = document.createElement('div');
  element.style.padding = '20px';
  element.style.fontFamily = 'Arial, sans-serif';
  element.style.fontSize = '12px';

  const allergenText = data.allergens.contem.length > 0
    ? `ALÉRGICOS: CONTÉM ${data.allergens.contem.join(', ')}.`
    : '';
  const podeConterText = data.allergens.podeConter.length > 0
    ? `ALÉRGICOS: PODE CONTER ${data.allergens.podeConter.join(', ')}.`
    : '';

  const frontLabelText = `${
    data.frontLabel.altoEmAddedSugar ? 'ALTO EM AÇÚCARES ADICIONADOS\n' : ''
  }${
    data.frontLabel.altoEmSatFat ? 'ALTO EM GORDURAS SATURADAS\n' : ''
  }${
    data.frontLabel.altoEmSodium ? 'ALTO EM SÓDIO\n' : ''
  }`;

  element.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 24px;">RotulagemBR</h1>
      <h2 style="margin: 5px 0; font-size: 18px;">${data.recipeName}</h2>
      <p style="margin: 5px 0; color: #666;">Categoria: ${data.category} | Tipo: ${data.productType === 'solid' ? 'Sólido' : 'Líquido'}</p>
    </div>

    <div style="margin-bottom: 20px; border: 1px solid #ccc; padding: 15px;">
      <h3 style="margin-top: 0; border-bottom: 2px solid #333; padding-bottom: 5px;">INFORMAÇÕES DA RECEITA</h3>
      <p><strong>Rendimento final:</strong> ${data.finalYieldG}g</p>
      <p><strong>Porção:</strong> ${data.portionG}g (${data.householdMeasure})</p>
      <p><strong>Número de porções:</strong> ${data.numPortions}</p>
    </div>

    <div style="margin-bottom: 20px; border: 1px solid #ccc; padding: 15px;">
      <h3 style="margin-top: 0; border-bottom: 2px solid #333; padding-bottom: 5px;">INGREDIENTES</h3>
      <ul style="margin: 10px 0; padding-left: 20px;">
        ${data.ingredients.map(ing => `<li>${ing.name} - ${ing.quantityG}g</li>`).join('')}
      </ul>
    </div>

    <div style="margin-bottom: 20px; border: 1px solid #ccc; padding: 15px;">
      <h3 style="margin-top: 0; border-bottom: 2px solid #333; padding-bottom: 5px;">INFORMAÇÃO NUTRICIONAL</h3>
      <p style="font-size: 10px; color: #666; margin-bottom: 10px;">Porção: ${data.portionG}g | Valor energético total: ${data.nutritionResults.perPortion.energyKcal}kcal</p>

      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background-color: #f0f0f0; border-bottom: 2px solid #333;">
            <th style="text-align: left; padding: 5px; border-right: 1px solid #ccc;">Nutriente</th>
            <th style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">Por Porção</th>
            <th style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">%VD</th>
            <th style="text-align: center; padding: 5px;">Por 100g</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 5px; border-right: 1px solid #ccc;">Valor energético</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.displayValues.perPortion.energyKcal}kcal</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.vdPercent.energyKcal || '-'}%</td>
            <td style="text-align: center; padding: 5px;">${data.nutritionResults.displayValues.per100g.energyKcal}kcal</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 5px; border-right: 1px solid #ccc;">Carboidratos</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.displayValues.perPortion.carbohydrates}g</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.vdPercent.carbohydrates || '-'}%</td>
            <td style="text-align: center; padding: 5px;">${data.nutritionResults.displayValues.per100g.carbohydrates}g</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 5px; border-right: 1px solid #ccc;">Açúcares adicionados</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.displayValues.perPortion.addedSugars}g</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.vdPercent.addedSugars || '-'}%</td>
            <td style="text-align: center; padding: 5px;">${data.nutritionResults.displayValues.per100g.addedSugars}g</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 5px; border-right: 1px solid #ccc;">Proteínas</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.displayValues.perPortion.proteins}g</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.vdPercent.proteins || '-'}%</td>
            <td style="text-align: center; padding: 5px;">${data.nutritionResults.displayValues.per100g.proteins}g</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 5px; border-right: 1px solid #ccc;">Gorduras totais</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.displayValues.perPortion.totalFat}g</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.vdPercent.totalFat || '-'}%</td>
            <td style="text-align: center; padding: 5px;">${data.nutritionResults.displayValues.per100g.totalFat}g</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 5px; border-right: 1px solid #ccc;">Gorduras saturadas</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.displayValues.perPortion.saturatedFat}g</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.vdPercent.saturatedFat || '-'}%</td>
            <td style="text-align: center; padding: 5px;">${data.nutritionResults.displayValues.per100g.saturatedFat}g</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 5px; border-right: 1px solid #ccc;">Gorduras trans</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.displayValues.perPortion.transFat}g</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.vdPercent.transFat || '-'}%</td>
            <td style="text-align: center; padding: 5px;">${data.nutritionResults.displayValues.per100g.transFat}g</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 5px; border-right: 1px solid #ccc;">Fibra alimentar</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.displayValues.perPortion.fiber}g</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.vdPercent.fiber || '-'}%</td>
            <td style="text-align: center; padding: 5px;">${data.nutritionResults.displayValues.per100g.fiber}g</td>
          </tr>
          <tr>
            <td style="padding: 5px; border-right: 1px solid #ccc;">Sódio</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.displayValues.perPortion.sodium}mg</td>
            <td style="text-align: center; padding: 5px; border-right: 1px solid #ccc;">${data.nutritionResults.vdPercent.sodium || '-'}%</td>
            <td style="text-align: center; padding: 5px;">${data.nutritionResults.displayValues.per100g.sodium}mg</td>
          </tr>
        </tbody>
      </table>
    </div>

    ${frontLabelText ? `
    <div style="margin-bottom: 20px; border: 2px solid #FF6B6B; padding: 15px; background-color: #FFE5E5;">
      <h3 style="margin-top: 0; color: #FF6B6B;">ROTULAGEM FRONTAL - LUPA</h3>
      <p style="margin: 0; font-weight: bold; font-size: 14px;">${frontLabelText.replace(/\n/g, '<br>')}</p>
    </div>
    ` : ''}

    ${allergenText || podeConterText ? `
    <div style="margin-bottom: 20px; border: 1px solid #FF9800; padding: 15px;">
      <h3 style="margin-top: 0; color: #FF9800;">ALERGÊNICOS</h3>
      ${allergenText ? `<p style="margin: 5px 0;"><strong>${allergenText}</strong></p>` : ''}
      ${podeConterText ? `<p style="margin: 5px 0;"><strong>${podeConterText}</strong></p>` : ''}
    </div>
    ` : ''}

    <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; text-align: center; font-size: 10px; color: #999;">
      <p>Baseado em: RDC 429/2020, IN 75/2020, RDC 359/2003, RDC 26/2015</p>
      <p>Gerado por RotulagemBR em ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>
  `;

  const opt = {
    margin: 10,
    filename: `${data.recipeName.replace(/\s+/g, '_')}_rotulagem.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
  };

  // Dynamic import para reduzir tamanho do bundle
  const html2pdf = (await import('html2pdf.js')).default;
  html2pdf().set(opt).from(element).save();
}
