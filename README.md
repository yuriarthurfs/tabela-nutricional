# RotulagemBR

Sistema completo para geração de **Tabela de Informação Nutricional** (modelo vertical) e **Rotulagem Nutricional Frontal** (lupa "ALTO EM...") para alimentos no Brasil.

## Regulamentações Implementadas

- **RDC 429/2020** - Rotulagem Nutricional Frontal
- **IN 75/2020** - Requisitos técnicos para declaração de rotulagem nutricional
- **RDC 359/2003** - Porções de alimentos (fallback)
- **RDC 26/2015** - Declaração de alergênicos

## Funcionalidades

### 1. Cadastro de Receitas
- Nome do produto e categoria
- Tipo (sólido/líquido)
- Rendimento final (g/ml)
- Definição de porção e medida caseira
- Número de porções

### 2. Gestão de Ingredientes
- Busca integrada com base TACO do Supabase
- Suporta todos os alimentos da tabela TACO completa
- Cruzamento automático com gorduras (ácidos graxos)
- Cálculo automático de nutrientes por 100g
- Adição e remoção de ingredientes

### 3. Açúcares Adicionados
- Campo específico para açúcares adicionados
- Essencial para cálculo correto de %VD e rotulagem frontal
- Validação obrigatória

### 4. Motor de Cálculo Nutricional

#### Valores calculados:
- Energia (kcal e kJ)
- Carboidratos
- Açúcares totais
- Açúcares adicionados
- Proteínas
- Gorduras totais
- Gorduras saturadas
- Gorduras trans
- Fibra alimentar
- Sódio

#### Regras implementadas:
- **Arredondamento** conforme IN 75/2020 Anexo III
- **Quantidades não significativas** ("zero") conforme Anexo IV
- **%VD** baseado em dieta de 2000 kcal
- **Valores por porção** e **por 100g/100ml**

### 5. Rotulagem Frontal (Lupa)

Avaliação automática com base em limites por 100g/100ml:

**Sólidos:**
- Açúcares adicionados ≥15g
- Gorduras saturadas ≥6g
- Sódio ≥600mg

**Líquidos:**
- Açúcares adicionados ≥7,5g
- Gorduras saturadas ≥3g
- Sódio ≥300mg

### 6. Gerenciamento de Alergênicos

- **Detecção automática** por ingredientes
- **"PODE CONTER"** por contaminação cruzada (manual)
- Justificativa obrigatória
- Frase padronizada para rótulo

### 7. Relatório de Conformidade

Checklist automático verificando:
- Cálculos nutricionais
- Arredondamento
- %VD
- Rotulagem frontal
- Alergênicos

## Tecnologias

- **Frontend:** React + TypeScript + Vite
- **Estilização:** Tailwind CSS
- **Banco de Dados:** Supabase (PostgreSQL)
- **Ícones:** Lucide React

## Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── RecipeForm.tsx
│   ├── IngredientSearch.tsx
│   ├── AddedSugarsForm.tsx
│   ├── NutritionTable.tsx
│   ├── FrontLabel.tsx
│   └── AllergenManager.tsx
├── lib/
│   ├── nutritionEngine/  # Motor de cálculos
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   ├── calculations.ts
│   │   └── rounding.ts
│   ├── tacoClient.ts     # Integração TACO
│   ├── allergenMapping.ts
│   └── supabase.ts
└── App.tsx               # Aplicação principal
```

## Base de Dados

### Tabelas:
- `recipes` - Receitas/produtos
- `ingredient_lines` - Ingredientes com snapshot TACO
- `added_sugars` - Açúcares adicionados
- `nutrition_totals` - Totais calculados
- `front_labels` - Rotulagem frontal
- `allergens` - Alergênicos

## Como Usar

### 1. Criar Nova Receita
- Preencha informações básicas do produto
- Selecione categoria para porção padrão
- Defina rendimento final e número de porções

### 2. Adicionar Ingredientes
- Busque ingredientes na base TACO
- Informe quantidade em gramas
- Adicione todos os ingredientes da receita

### 3. Informar Açúcares Adicionados
- Calcule total de açúcares adicionados (açúcar, mel, xarope)
- Campo obrigatório para conformidade

### 4. Visualizar Resultados
- Tabela nutricional vertical completa
- Rotulagem frontal (se aplicável)
- Gerenciar alergênicos
- Relatório de conformidade

## Integração com Banco de Dados

### Origem dos Dados

A aplicação utiliza três tabelas do Supabase:

1. **tabela_taco** - Dados nutricionais principais
   - Descrição, categoria e todos os nutrientes básicos
   - 25+ nutrientes por alimento
   - Busca por descrição e categoria

2. **acidos_graxos** - Perfil completo de lipídeos
   - Gorduras saturadas, monoinsaturadas e poliinsaturadas
   - Gorduras trans (isômeros específicos)
   - Cruzamento automático por número do alimento

3. **aminoacidos** - Perfil de aminoácidos (pré-mapeado)
   - 18 aminoácidos essenciais e não-essenciais
   - Disponível para futuras análises

### Alimentos Disponíveis

Todos os alimentos cadastrados na tabela TACO são automaticamente disponíveis para busca, incluindo:
- Frutas e vegetais
- Cereais e farinhas
- Proteínas (carne, peixe, ovos, leguminosas)
- Laticínios
- Óleos e gorduras
- Bebidas
- E muito mais...

## Melhorias Futuras

- [ ] Exportação PNG/SVD/PDF
- [ ] Cálculo de vitaminas e minerais nos resultados
- [ ] Histórico de receitas com persistência
- [ ] Autenticação de múltiplos usuários
- [ ] Templates de rótulos customizáveis
- [ ] Validação avançada de porções não-padrão
- [ ] Cache local de alimentos para performance
- [ ] Sugestão de ingredientes por similaridade

## Conformidade Regulatória

Este sistema implementa as principais regulamentações brasileiras de rotulagem nutricional:

- ✅ Cálculos conforme IN 75/2020
- ✅ Arredondamento e quantidades não significativas
- ✅ %VD baseado em VDR corretos
- ✅ Rotulagem frontal RDC 429/2020
- ✅ Alergênicos RDC 26/2015

**Nota:** Este é um sistema de apoio. Consulte sempre um profissional habilitado para validação final dos rótulos.

## Licença

Este projeto foi desenvolvido para fins educacionais e de conformidade regulatória.
