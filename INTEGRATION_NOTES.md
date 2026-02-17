# Integração com Banco de Dados TACO

## Alterações Realizadas

### 1. **tacoClient.ts** - Integração com Supabase

O arquivo foi completamente refatorado para puxar dados diretamente do banco de dados em vez de usar uma base local.

#### Mudanças principais:

**Interfaces atualizadas:**
- `NutrientData`: Estrutura completa de nutrientes com campos em camelCase
- `TacoFood`: Interface do alimento com `numero_alimento`, `categoria`, `descricao`

**Funções principais:**

1. **`searchFoods(query: string)`**
   - Busca na tabela `tabela_taco`
   - Filtra por descrição e categoria
   - Retorna até 20 resultados
   - Limpa valores `null` e converte vírgulas em pontos

2. **`getFoodById(numeroAlimento: string)`**
   - Busca um alimento específico por número
   - Cruza dados com `acidos_graxos` para gorduras (saturadas, trans, monoinsaturadas, poliinsaturadas)
   - Retorna alimento com dados nutricionais completos

3. **`getAllFoods()`**
   - Retorna até 500 alimentos da base
   - Usado para populações futuras de caches

**Tabelas utilizadas:**

- `tabela_taco`: Dados principais de nutrientes
  - Coluna de busca: `Descrição dos alimentos`, `Categoria do alimento`
  - Chave de cruzamento: `Número do Alimento`

- `acidos_graxos`: Ácidos graxos específicos
  - Cruzamento por: `Número do Alimento`
  - Campos extraídos:
    - `Saturados..g.` → gorduras_saturadas_g
    - `Mono.insaturados..g.` → gorduras_monoinsaturadas_g
    - `Poli.insaturados..g.` → gorduras_poliinsaturadas_g
    - `X18.1t..g.` + `X18.2t..g.` → gorduras_trans_g

- `aminoacidos`: Perfil de aminoácidos (pré-mapeado para uso futuro)
  - Cruzamento por: `Número do Alimento`

**Helper function:**

- `parseNumber()`: Converte strings com vírgulas para números válidos (0 se inválido)

### 2. **IngredientSearch.tsx** - Adaptação de componente

Ajustes para compatibilidade com nova estrutura:

- **Linha 44**: Mudança de `selectedFood.id` para `selectedFood.numero_alimento`
- **Linha 45**: Mudança de `selectedFood.name` para `selectedFood.descricao`
- **Linhas 77-83**: Exibição de descrição e categoria no dropdown

### 3. **Mapeamento de campos TACO**

A tabela `tabela_taco` contém as seguintes colunas (exemplo de mapeamento):

```
Nutriente TACO              → Campo interno
Energia..kcal.              → energia_kcal
Energia..kJ.                → energia_kj
Proteína..g.                → proteina_g
Lipídeos..g.                → lipidios_g
Carboidrato..g.             → carboidratos_g
Fibra.Alimentar..g.         → fibra_g
Sódio..mg.                  → sodio_mg
Cálcio..mg.                 → calcio_mg
Magnésio..mg.               → magnesio_mg
Fósforo..mg.                → fosforo_mg
Ferro..mg.                  → ferro_mg
Potássio..mg.               → potassio_mg
Cobre..mg.                  → cobre_mg
Zinco..mg.                  → zinco_mg
Manganês..mg.               → manganio_mg
Colesterol..mg.             → colesterol_mg
Retinol..mcg.               → retinol_mcg
Vitamina.C..mg.             → vitamina_c_mg
Tiamina..mg.                → tiamina_mg
Riboflavina..mg.            → riboflavina_mg
Piridoxina..mg.             → piridoxina_mg
Niacina..mg.                → niacina_mg
```

### 4. **Estrutura de dados retornada**

```typescript
interface TacoFood {
  id: string;                              // "${numero_alimento}-${index}"
  numero_alimento: string;                 // Chave de cruzamento
  categoria: string;                       // Categoria do alimento
  descricao: string;                       // Descrição completa
  nutrients: NutrientData;                 // Todos os nutrientes
}
```

## Conformidade com Regulamentações

Os dados extraídos das tabelas TACO estão alinhados com:

- **IN 75/2020**: Requisitos técnicos para rotulagem nutricional
- **RDC 359/2003**: Porções de alimentos
- **TACO oficial**: Base de composição de alimentos brasileiros

## Performance

- **Busca**: Limitada a 20 resultados (`.limit(20)`)
- **Sem cache**: Cada busca consulta o banco
- **Future improvement**: Implementar cache local com IndexedDB se necessário

## Tratamento de erros

Todas as funções:
- Usam `try/catch` para capturar erros de conexão
- Retornam arrays/objetos vazios em caso de erro
- Registram erros no console para debugging

## Próximas etapas

1. Testar com dados reais do banco
2. Validar conversão de unidades se necessário
3. Implementar cache se performance for problema
4. Adicionar aminoácidos aos cálculos nutricionais
5. Validar limites de gorduras saturadas vs trans
