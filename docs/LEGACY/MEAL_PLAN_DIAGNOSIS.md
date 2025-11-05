
# Diagnóstico Completo - Sistema de Geração de Plano Alimentar

## 1. Análise do Schema meal_plan_items

### Valores Válidos para meal_type
Baseado no schema e tipos definidos:
- `cafe_da_manha`
- `lanche_manha` 
- `almoco`
- `lanche_tarde`
- `jantar`
- `ceia`

### Problemas Identificados

#### A. Inconsistência nos Valores de meal_type
- Função `generate_meal_plan_with_cultural_rules` usa: `['cafe_da_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia']`
- Função `generate_meal_plan` usa: `['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack']`
- Frontend usa: variações inconsistentes

#### B. Falhas na Geração de PDF
- Conversão incorreta de dados de meals
- Propriedades ausentes ou incorretas
- Tipos não compatíveis com a função generateMealPlanPDF

#### C. Fluxos Duplicados e Desatualizados
- Múltiplos serviços de meal plan (MealPlanService, MealPlanServiceV2)
- Hooks desatualizados (useMealPlanGeneration, useMealPlanActions)
- Contextos sobrepostos (MealPlanWorkflowContext, MealPlanContext)

## 2. Plano de Correção

### Fase 1: Padronização do meal_type
1. Definir enum único para meal_type
2. Atualizar todos os pontos de uso
3. Corrigir funções RPC no backend

### Fase 2: Consolidação de Serviços
1. Unificar em MealPlanServiceV3
2. Deprecar serviços antigos
3. Atualizar todos os hooks

### Fase 3: Correção do PDF
1. Normalizar estrutura de dados
2. Corrigir tipos e conversões
3. Implementar validação robusta

## 3. Pontos Críticos Identificados

### Backend (Supabase Functions)
- `generate_meal_plan_with_cultural_rules`: usa português ✓
- `generate_meal_plan`: usa inglês ✗

### Frontend
- `MealPlanEditor`: espera português ✓
- `MealTypeSection`: usa português ✓
- `PdfActionButtons`: conversão incorreta ✗

### Hooks e Serviços
- `useMealPlanGeneration`: usa MealPlanServiceV2 ✗
- `MealPlanServiceV2`: inconsistente ✗
- `generateMealPlanPDF`: espera estrutura específica ✗
