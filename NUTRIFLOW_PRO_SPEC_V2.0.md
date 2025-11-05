# NutriFlow Pro: Especificação Técnica V2.0 (Fonte Única de Verdade)

**Versão:** 2.0  
**Data de Criação:** 2025-11-05  
**Status:** OFICIAL - Documento Mestre (SSOT - Single Source of Truth)

---

## 📋 Índice

1. [Arquitetura e Coeficiente Comum de Alinhamento](#1-arquitetura-e-coeficiente-comum-de-alinhamento)
2. [Lógica de Cálculo Nutricional e Precisão Clínica](#2-lógica-de-cálculo-nutricional-e-precisão-clínica)
3. [Fluxo de Dados e Integração](#3-fluxo-de-dados-e-integração)
4. [Distribuição de Refeições e Meal Planning](#4-distribuição-de-refeições-e-meal-planning)
5. [Prioridades de Implementação](#5-prioridades-de-implementação)
6. [Tecnologias e Stack](#6-tecnologias-e-stack)

---

## 1. Arquitetura e Coeficiente Comum de Alinhamento

### 1.1 Princípio SSOT (Single Source of Truth)

O NutriFlow Pro adota o princípio de **Fonte Única de Verdade**, consolidado em uma arquitetura centralizada que garante a integridade do fluxo clínico.

#### Hierarquia de Providers (SSOT)

```
AuthContext (Autenticação)
    └── PatientProvider (Gerenciamento Geral de Pacientes)
            └── ConsultationDataProvider (SSOT do Fluxo Clínico) ✅ PRINCIPAL
                    └── MealPlanProvider (Funcionalidades Específicas de Planos)
```

**REGRA CRÍTICA:** Qualquer leitura ou escrita de dados de consulta (paciente, antropometria, cálculos) DEVE passar exclusivamente pelo `ConsultationDataProvider`.

### 1.2 Motor de Cálculo Centralizado

**Hook Oficial:** `useOfficialCalculations`  
**Localização:** `src/hooks/useOfficialCalculations.ts`

**REGRA CRÍTICA:** Toda e qualquer lógica de cálculo nutricional (TMB, GET, Macros) DEVE ser implementada e consumida através deste hook.

**Lógica Matemática:** `src/utils/nutrition/official/formulas.ts`  
**Interface da Calculadora:** `src/components/calculator/official/OfficialCalculatorForm.tsx`

### 1.3 Integração com Backend (Supabase)

**REGRA CRÍTICA:** Componentes NÃO devem acessar o Supabase diretamente. Toda interação deve passar por serviços em `src/services/`.

**Biblioteca de Data Fetching:** TanStack Query (React Query)

```typescript
// ❌ ERRADO - Acesso direto no componente
import { supabase } from '@/integrations/supabase/client';
const { data } = await supabase.from('patients').select('*');

// ✅ CORRETO - Usar serviços
import { PatientService } from '@/services/patient';
const patients = await PatientService.getAll();
```

---

## 2. Lógica de Cálculo Nutricional e Precisão Clínica

### 2.1 Fórmulas de TMB (Taxa Metabólica Basal)

O sistema deve usar as fórmulas exatas com coeficientes corrigidos para maior precisão clínica.

#### Fórmulas Implementadas

| Fórmula | Gênero | Equação | Quando Usar | Fonte |
|---------|--------|---------|-------------|-------|
| **Harris-Benedict Revisada** | Homens | **66.5** + (13.75 × P) + (5.003 × A) - (6.75 × I) | Eutróficos | Roza & Shizgal (1984) |
| **Harris-Benedict Revisada** | Mulheres | **655.1** + (9.563 × P) + (1.850 × A) - (4.676 × I) | Eutróficos | Roza & Shizgal (1984) |
| **Mifflin-St Jeor** | Homens | (10 × P) + (6.25 × A) - (5 × I) + **5** | Sobrepeso/Obesidade | Mifflin et al. (1990) |
| **Mifflin-St Jeor** | Mulheres | (10 × P) + (6.25 × A) - (5 × I) - **161** | Sobrepeso/Obesidade | Mifflin et al. (1990) |
| **Tinsley** | Ambos | 24.8 × P + 10 | Atletas | Tinsley et al. (2019) |
| **Katch-McArdle** | Ambos | 370 + (21.6 × MM) | Atletas com %GC conhecido | Katch & McArdle (1996) |
| **Cunningham** | Ambos | 500 + (22 × MM) | Atletas com %GC conhecido | Cunningham (1980) |
| **OMS/FAO/UNU** | Ambos | Fórmulas por faixa etária | Saúde pública | WHO/FAO/UNU (2001) |

**Legenda:**
- **P** = Peso (kg)
- **A** = Altura (cm)
- **I** = Idade (anos)
- **MM** = Massa Magra (kg)

#### Fórmulas OMS/FAO/UNU por Faixa Etária

**Homens:**
| Faixa Etária | Fórmula |
|--------------|---------|
| 18-30 anos | (15.3 × P) + 679 |
| 30-60 anos | (11.6 × P) + 879 |
| > 60 anos | (13.5 × P) + 487 |

**Mulheres:**
| Faixa Etária | Fórmula |
|--------------|---------|
| 18-30 anos | (14.7 × P) + 496 |
| 30-60 anos | (8.7 × P) + 829 |
| > 60 anos | (10.5 × P) + 596 |

### 2.2 Fatores de Atividade (F.A.) - GET Calculation

**REGRA CRÍTICA:** Os fatores de atividade DEVEM ser diferenciados por perfil do paciente.

#### Fatores de Atividade por Perfil (SSOT V2.0)

| Nível de Atividade | F.A. (Eutróficos) | F.A. (Obesos/Sobrepeso) | F.A. (Atletas) |
|-------------------|-------------------|------------------------|----------------|
| **Sedentário** | 1.20 | 1.30 | 1.20 |
| **Levemente Ativo** | 1.375 | 1.50 | 1.375 |
| **Moderadamente Ativo** | 1.55 | 1.60 | 1.55 |
| **Muito Ativo** | 1.725 | 1.80 | 1.725 |
| **Extremamente Ativo** | 1.90 | 2.00 | 1.90 |

**Cálculo do GET:**
```
GET = TMB × Fator de Atividade (baseado no perfil)
```

### 2.3 Distribuição de Macronutrientes (SSOT Final)

**REGRA CRÍTICA:** A distribuição segue a lógica de prioridade:  
**PTN (g/kg) → LIP (g/kg) → CHO (por diferença do VET)**

#### Valores Formalizados (g/kg)

| Perfil do Paciente | PTN (g/kg) | LIP (g/kg) | CHO |
|-------------------|------------|------------|-----|
| **Eutrófico** | **1.8** | **0.8** | Por diferença |
| **Sobrepeso/Obesidade** | **2.0** | **0.5** | Por diferença |
| **Atleta** | **2.2** | **1.0** | Por diferência |

#### Fluxo de Cálculo de Macronutrientes

1. **Calcular Proteína (PTN):**
   ```
   PTN (g) = Peso (kg) × Ratio PTN (g/kg)
   PTN (kcal) = PTN (g) × 4 kcal/g
   ```

2. **Calcular Lipídios (LIP):**
   ```
   LIP (g) = Peso (kg) × Ratio LIP (g/kg)
   LIP (kcal) = LIP (g) × 9 kcal/g
   ```

3. **Calcular Carboidratos (CHO) por diferença:**
   ```
   CHO (kcal) = VET - (PTN_kcal + LIP_kcal)
   CHO (g) = CHO (kcal) ÷ 4 kcal/g
   ```

4. **Calcular Percentagens (outputs):**
   ```
   PTN_% = (PTN_kcal / VET) × 100
   LIP_% = (LIP_kcal / VET) × 100
   CHO_% = (CHO_kcal / VET) × 100
   ```

### 2.4 Ajuste Calórico por Objetivo

| Objetivo | Ajuste do VET |
|----------|---------------|
| Perda de Peso | GET × 0.85 (déficit de 15%) |
| Manutenção | GET × 1.0 (sem ajuste) |
| Ganho de Peso | GET × 1.15 (superávit de 15%) |

### 2.5 Composição Corporal (Dobras Cutâneas)

#### Protocolos de Avaliação

**Jackson & Pollock 3-Site (Homens):**
- Dobras: Peitoral, Abdominal, Coxa
- Fórmula: `BD = 1.10938 - (0.0008267 × Σ) + (0.0000016 × Σ²) - (0.0002574 × Idade)`

**Jackson & Pollock 3-Site (Mulheres):**
- Dobras: Tríceps, Suprailíaca, Coxa
- Fórmula: `BD = 1.0994921 - (0.0009929 × Σ) + (0.0000023 × Σ²) - (0.0001392 × Idade)`

**Jackson & Pollock 7-Site (Ambos):**
- Dobras: Peitoral, Tríceps, Subescapular, Suprailíaca, Abdominal, Coxa, Axilar Média

#### Conversão para Percentual de Gordura

**Fórmula de Siri:**
```
%GC = (495 / BD) - 450
```

**Fórmula de Brozek (alternativa):**
```
%GC = (457 / BD) - 414.2
```

#### Cálculo de Massa Magra

```
Massa Gorda (kg) = Peso × (%GC / 100)
Massa Magra (kg) = Peso - Massa Gorda
```

---

## 3. Fluxo de Dados e Integração

### 3.1 Diagrama de Fluxo do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     FLUXO CLÍNICO COMPLETO                  │
└─────────────────────────────────────────────────────────────┘

1. Seleção de Paciente (PatientProvider)
   └─> PatientService.getAll() → Supabase

2. Entrada de Dados Antropométricos (OfficialCalculatorForm)
   └─> Peso, Altura, Idade, Sexo, Perfil, Nível de Atividade

3. Cálculo Nutricional (useOfficialCalculations)
   └─> calculateTMB_Official() → calculateGET_Official()
       └─> calculateMacros_Official()

4. Persistência de Dados (ConsultationDataProvider)
   └─> Auto-save em consultationData state
       └─> ConsultationService.upsert() → Supabase

5. Geração de Plano Alimentar
   └─> Navegação para /meal-plan-builder
       └─> MealPlanProvider + ConsultationDataContext
           └─> generate_meal_plan_with_cultural_rules (RPC)

6. Finalização
   └─> Salvar Plano → meal_plans table (Supabase)
```

### 3.2 Normalização de Dados de Macros

**Problema Histórico:** Macros salvos como objetos `{ grams: number }` em vez de números.

**Solução (Implementada):** Função `normalizeMacros()` no `ConsultationDataProvider`

```typescript
const normalizeMacros = (m: any) => {
  if (!m) return m;
  const isObj = (x: any) => x && typeof x === 'object' && 'grams' in x;
  
  return {
    protein: isObj(m.protein) ? m.protein.grams ?? 0 : m.protein ?? 0,
    carbs: isObj(m.carbs) ? m.carbs.grams ?? 0 : m.carbs ?? 0,
    fat: isObj(m.fat) ? m.fat.grams ?? 0 : m.fat ?? 0
  };
};
```

### 3.3 Validações Obrigatórias

Antes de permitir a geração de plano alimentar:

- [ ] Paciente selecionado (`consultationData.patientId`)
- [ ] Dados antropométricos completos (peso, altura, idade, sexo)
- [ ] Perfil do paciente definido
- [ ] Nível de atividade selecionado
- [ ] VET calculado (> 0)
- [ ] Macros calculados (protein, carbs, fat > 0)

---

## 4. Distribuição de Refeições e Meal Planning

### 4.1 Padrão de 6 Refeições (SSOT)

**REGRA CRÍTICA:** Todos os serviços de Meal Plan (Frontend, Hooks, Serviços e Funções RPC do Supabase) devem usar esta padronização em **Português**.

| Refeição | Nome Padronizado (SSOT) | % do VET (Padrão) | Horário Sugerido |
|----------|-------------------------|-------------------|------------------|
| Refeição 1 | `cafe_da_manha` | 25% | 07:00 - 08:00 |
| Refeição 2 | `lanche_manha` | 10% | 10:00 - 11:00 |
| Refeição 3 | `almoco` | 30% | 12:00 - 13:00 |
| Refeição 4 | `lanche_tarde` | 10% | 15:00 - 16:00 |
| Refeição 5 | `jantar` | 20% | 19:00 - 20:00 |
| Refeição 6 | `ceia` | 5% | 22:00 - 23:00 |

### 4.2 Enum de Tipos de Refeição

**Schema Supabase:** `meal_plan_items.meal_type`

```sql
CREATE TYPE meal_type_enum AS ENUM (
  'cafe_da_manha',
  'lanche_manha',
  'almoco',
  'lanche_tarde',
  'jantar',
  'ceia'
);
```

### 4.3 Função RPC de Geração de Plano

**Função Oficial:** `generate_meal_plan_with_cultural_rules`

**Input:**
```typescript
{
  target_calories: number,
  target_protein_g: number,
  target_carbs_g: number,
  target_fat_g: number,
  num_meals: number, // Padrão: 6
  meal_distribution?: number[] // Padrão: [25, 10, 30, 10, 20, 5]
}
```

**Output:**
```typescript
{
  meals: Array<{
    meal_type: 'cafe_da_manha' | 'lanche_manha' | ...
    foods: Array<{
      food_id: string,
      quantity: number,
      unit: string
    }>
  }>
}
```

---

## 5. Prioridades de Implementação

### Fase 1: Documentação ✅
**Status:** EM ANDAMENTO  
**Objetivo:** Estabelecer SSOT na documentação

- [x] Criar `NUTRIFLOW_PRO_SPEC_V2.0.md`
- [x] Arquivar documentos legados em `/docs/LEGACY/`
- [x] Criar `docs/LEGACY/README.md`

### Fase 2: Refatoração Crítica
**Objetivo:** Corrigir divergências de código

**Tarefas:**
1. Corrigir coeficientes Harris-Benedict (4 linhas)
2. Implementar `getActivityFactor(level, profile)`
3. Remover marcação `DEPRECATED` de `LIPID_RATIOS`
4. Adicionar logs de auditoria

**Arquivos Afetados:**
- `src/utils/nutrition/official/officialCalculations.ts`
- `src/types/consultation.ts`

### Fase 3: Expansão Funcional
**Objetivo:** Adicionar novas equações e composição corporal

**Tarefas:**
1. Implementar 4 novas fórmulas de TMB
   - Katch-McArdle
   - Cunningham
   - OMS/FAO/UNU
   - Penn State
2. Criar `src/utils/nutrition/bodyComposition.ts`
3. Criar `src/components/calculator/SkinfoldForm.tsx`
4. Integrar `leanBodyMass` em `calculateTMB_Official()`

---

## 6. Tecnologias e Stack

### 6.1 Frontend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **React** | 18.3.1 | Framework UI |
| **TypeScript** | Latest | Tipagem estática |
| **Vite** | Latest | Build tool |
| **React Router** | 6.26.2 | Roteamento |
| **TanStack Query** | 5.56.2 | Data fetching e cache |
| **Shadcn UI** | Latest | Biblioteca de componentes |
| **Tailwind CSS** | Latest | Estilização |
| **React Hook Form** | 7.53.0 | Gerenciamento de formulários |
| **Zod** | 3.23.8 | Validação de schemas |

### 6.2 Backend (Supabase)

| Componente | Uso |
|-----------|-----|
| **PostgreSQL** | Banco de dados relacional |
| **Supabase Auth** | Autenticação de usuários |
| **Supabase Storage** | Armazenamento de arquivos |
| **Supabase Functions (Edge)** | Lógica serverless |
| **Row Level Security (RLS)** | Segurança de dados |

### 6.3 Convenções de Código

**Nomenclatura:**
- Componentes: PascalCase (`PatientList.tsx`)
- Hooks: camelCase com prefixo `use` (`useOfficialCalculations.ts`)
- Services: PascalCase com sufixo `Service` (`PatientService.ts`)
- Utils: camelCase (`macronutrientCalculations.ts`)
- Tipos: PascalCase (`ConsultationData`)

**Estrutura de Diretórios:**
```
src/
├── components/       # Componentes reutilizáveis
│   ├── calculator/  # Calculadora oficial
│   ├── ui/          # Shadcn UI components
├── contexts/        # React Context Providers
├── hooks/           # Custom hooks
├── pages/           # Páginas (rotas)
├── services/        # Serviços de API (Supabase)
├── types/           # Definições de tipos TypeScript
└── utils/           # Funções utilitárias
    └── nutrition/   # Lógica nutricional
```

---

## 📚 Referências e Fontes Científicas

1. **Roza, A. M., & Shizgal, H. M. (1984).** The Harris Benedict equation reevaluated: resting energy requirements and the body cell mass. *The American Journal of Clinical Nutrition*, 40(1), 168-182.

2. **Mifflin, M. D., et al. (1990).** A new predictive equation for resting energy expenditure in healthy individuals. *The American Journal of Clinical Nutrition*, 51(2), 241-247.

3. **Tinsley, G. M., et al. (2019).** Resting metabolic rate in muscular physique athletes: validity of existing methods and development of new prediction equations. *Applied Physiology, Nutrition, and Metabolism*, 44(4), 397-406.

4. **Katch, F. I., & McArdle, W. D. (1996).** *Introduction to nutrition, exercise, and health* (4th ed.). Lippincott Williams & Wilkins.

5. **Cunningham, J. J. (1980).** A reanalysis of the factors influencing basal metabolic rate in normal adults. *The American Journal of Clinical Nutrition*, 33(11), 2372-2374.

6. **WHO/FAO/UNU. (2001).** *Human energy requirements: Report of a Joint FAO/WHO/UNU Expert Consultation*. Food and Agriculture Organization.

7. **Jackson, A. S., & Pollock, M. L. (1978).** Generalized equations for predicting body density of men. *British Journal of Nutrition*, 40(3), 497-504.

8. **Siri, W. E. (1956).** *Body composition from fluid spaces and density*. In: Techniques for Measuring Body Composition. Washington, DC: National Academy of Sciences.

---

## ⚠️ Avisos Importantes

### Código Legado Deprecado

Os seguintes módulos estão marcados para remoção futura:

- ❌ `src/contexts/CalculatorContext.tsx` (substituído por `ConsultationDataProvider`)
- ❌ `src/services/MealPlanServiceV2.ts` (substituído por serviços unificados)

**NÃO USE estes módulos em novo código.**

### Proibições Críticas

1. **NÃO criar novos contextos** para cálculos nutricionais
2. **NÃO acessar Supabase diretamente** de componentes
3. **NÃO usar cores diretas** (ex: `text-white`, `bg-blue-500`) → Usar tokens semânticos
4. **NÃO duplicar lógica de cálculo** → Centralizar em `officialCalculations.ts`
5. **NÃO usar valores hardcoded** de macros → Usar constantes de `consultation.ts`

---

## 📝 Notas de Versão

**V2.0 (2025-11-05):**
- ✅ Formalização de coeficientes de Harris-Benedict Revisada
- ✅ Diferenciação de fatores de atividade por perfil
- ✅ Padronização de valores de PTN/LIP (g/kg)
- ✅ Consolidação de documentação (SSOT)
- ✅ Adição de novas equações (Katch-McArdle, Cunningham, OMS, Penn State)
- ✅ Sistema de composição corporal (dobras cutâneas)

**V1.0 (Histórico):**
- Sistema básico com Harris-Benedict, Mifflin-St Jeor e Tinsley
- ConsultationDataProvider implementado
- useOfficialCalculations criado

---

**FIM DO DOCUMENTO MESTRE V2.0**

Este documento substitui TODAS as especificações anteriores e serve como **Fonte Única de Verdade** para o projeto NutriFlow Pro.

Para documentação histórica, consulte `/docs/LEGACY/README.md`.
