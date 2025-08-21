
# AUDITORIA COMPLETA DO FLUXO DE ATENDIMENTO - NutriFlow Pro

## 1. FLUXOS EXISTENTES IDENTIFICADOS

### 1.1 Fluxos de Atendimento
- **ClinicalWorkflow** (`src/components/clinical/ClinicalWorkflow.tsx`)
  - Etapas: patient-selection → patient-info → anthropometry → meal-plan
  - Contexto: ConsultationDataContext + PatientContext
  
- **UnifiedConsultationFlow** (`src/components/unified/UnifiedConsultationFlow.tsx`)
  - Fluxo unificado com MealPlanWorkflowProvider
  - Integra cálculos + geração de plano alimentar

- **ConsultationPage** (legado)
  - Hooks: useConsultationFormHandler, useAutoSave
  - Múltiplos steps manuais

### 1.2 Contextos de Estado
- **PatientContext** - Fonte de verdade para pacientes
- **ConsultationDataContext** - Dados de consulta  
- **MealPlanContext** - Geração de planos
- **CalculatorContext** - Cálculos nutricionais (DEPRECATED)

### 1.3 Hooks de Cálculo
- **useCalculator** - Motor centralizado (✅ CORRETO)
- **useUnifiedCalculator** - Sistema paralelo (DUPLICADO)
- **useCalculatorState** - Estado legado (DEPRECATED)
- **useNutritionCalculator** - Wrapper legado (DEPRECATED)

### 1.4 Módulos de Cálculo
- **centralMotor/enpCore** - Motor nutricional correto (✅)
- **calculations/core** - Sistema antigo (DEPRECATED)
- **nutritionCalculations** - Funções legadas (DEPRECATED)
- **macronutrientCalculations** - Wrapper legado (DEPRECATED)

## 2. DIVERGÊNCIAS IDENTIFICADAS

### 2.1 Fórmulas TMB
- ✅ Harris-Benedict implementada corretamente
- ✅ Mifflin-St Jeor implementada corretamente  
- ⚠️ Seleção por perfil: alguns componentes ainda usam lógica antiga

### 2.2 Fatores de Atividade
- ✅ Valores corretos no motor central
- ❌ Mapeamento inconsistente entre tipos legados e novos

### 2.3 Distribuição de Macros
- ✅ Proteína por perfil correta (1.8, 2.0, 2.2 g/kg)
- ✅ Gordura 25% do GET
- ✅ Carboidrato por diferença

### 2.4 Distribuição de Refeições
- ✅ 6 refeições implementadas
- ✅ Percentuais corretos (25%, 10%, 30%, 10%, 20%, 5%)

## 3. PLANO DE CONSOLIDAÇÃO

### Fase 1: Fluxo Único Consolidado
- Criar **UnifiedClinicalWorkflow** como fluxo padrão
- Integrar todas as etapas dos fluxos existentes
- Usar apenas PatientContext + ConsultationDataContext

### Fase 2: Motor Nutricional Único
- Garantir que apenas **centralMotor/enpCore** seja usado
- Deprecar todos os outros módulos de cálculo
- Corrigir mapeamentos de tipos

### Fase 3: Testes e Validação
- Testes end-to-end do fluxo completo
- Validação com casos reais da planilha
- Documentação completa

## 4. FUNCIONALIDADES A PRESERVAR
- Seleção de paciente
- Coleta de dados antropométricos  
- Cálculos nutricionais automatizados
- Ajustes manuais do nutricionista
- Geração de plano alimentar
- Distribuição por refeições
- Exportação de resultados
- Auto-save de dados
