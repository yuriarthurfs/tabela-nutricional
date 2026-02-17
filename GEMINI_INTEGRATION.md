# Integração com Gemini Flash para Detecção de Açúcares

## Visão Geral

O sistema agora utiliza a API do Google Gemini Flash (versão gratuita) para detectar automaticamente açúcares adicionados e açúcares totais nos ingredientes, já que a tabela TACO não fornece essas informações de forma completa.

## Arquivos Modificados

### 1. **src/lib/geminiClient.ts** (NOVO)

Cliente para comunicação com a API do Gemini Flash.

#### Funções principais:

- **`detectAddedSugars(ingredientName, quantityG)`**
  - Detecta açúcares adicionados (açúcar refinado, mel, xarope, etc.)
  - Retorna quantidade em gramas
  - Exemplos de respostas esperadas:
    - 100g de achocolatado em pó → 20g
    - 50g de açúcar refinado → 50g
    - 100g de arroz → 0g
    - 200g de refrigerante de cola → 22g

- **`detectTotalSugars(ingredientName, quantityG)`**
  - Detecta açúcares totais (naturais + adicionados)
  - Retorna quantidade em gramas
  - Exemplos de respostas esperadas:
    - 100g de banana → 12g
    - 50g de açúcar refinado → 50g
    - 200g de leite integral → 10g

#### Configuração:

- API Key: `AIzaSyBovOfN5OM8H5pk7raMSZezzxLRfxgchOo`
- Model: `gemini-1.5-flash`
- Temperatura: 0.1 (para respostas mais precisas)
- Max Tokens: 50

### 2. **src/components/AddedSugarsForm.tsx**

Componente atualizado para usar Gemini na detecção de açúcares adicionados.

#### Mudanças:

- **Hook useEffect atualizado**: Agora faz chamadas assíncronas ao Gemini para cada ingrediente
- **Estado `isCalculating`**: Indica quando está calculando com IA
- **Estado `ingredientDetails`**: Armazena detalhes de cada ingrediente com açúcares detectados
- **UI melhorada**:
  - Indicador de carregamento durante cálculo
  - Lista detalhada mostrando açúcares por ingrediente
  - Input desabilitado durante cálculo
  - Botão com estado de loading

#### Fluxo:

1. Usuário adiciona ingredientes
2. Ao avançar para a etapa de açúcares, o sistema automaticamente:
   - Chama Gemini para cada ingrediente
   - Detecta açúcares adicionados
   - Soma todos os valores
   - Exibe o total calculado
3. Usuário pode ajustar manualmente se necessário

### 3. **src/App.tsx**

Aplicação principal atualizada para calcular açúcares totais.

#### Mudanças:

- **`handleSugarsSubmit` agora é async**: Aguarda cálculo de açúcares totais
- **Cálculo de açúcares totais**: Para cada ingrediente, chama Gemini para detectar açúcares totais
- **Conversão para per 100g**: Os valores retornados pelo Gemini são convertidos para base de 100g para compatibilidade com o motor de cálculo nutricional

#### Fluxo:

1. Usuário submete açúcares adicionados
2. Sistema chama Gemini para detectar açúcares totais de cada ingrediente
3. Converte valores para per 100g
4. Passa dados para motor de cálculo nutricional
5. Exibe resultados

## Vantagens da Integração

1. **Dados mais precisos**: Gemini tem conhecimento amplo sobre composição de alimentos
2. **Cobertura completa**: Funciona para qualquer alimento, não apenas os da tabela TACO
3. **Açúcares adicionados**: Detecta especificamente açúcares adicionados, não apenas totais
4. **Fácil manutenção**: Não requer atualização de base de dados local

## Tratamento de Erros

- Em caso de falha na API, retorna 0g
- Erros são logados no console
- Sistema continua funcionando normalmente
- Usuário pode ajustar valores manualmente se necessário

## Limitações

- **Rate limits**: API gratuita pode ter limites de requisições
- **Latência**: Chamadas à API podem levar alguns segundos
- **Dependência de internet**: Requer conexão para funcionar
- **Precisão**: Valores são estimativas baseadas no conhecimento do modelo

## Conformidade Regulatória

Esta implementação continua seguindo:
- **RDC 429/2020**: Rotulagem Nutricional Frontal
- **IN 75/2020**: Requisitos técnicos para rotulagem
- **RDC 359/2003**: Porções de alimentos

Os valores calculados são usados nas regras de arredondamento e limites regulatórios para rotulagem frontal ("ALTO EM...").

## Próximas Melhorias

1. Cache local de resultados para reduzir chamadas à API
2. Indicador de confiança nos valores detectados
3. Opção de desabilitar IA e usar valores manuais
4. Fallback para banco de dados local se API falhar
5. Batch de requisições para melhorar performance
