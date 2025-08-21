
# AUDITORIA COMPLETA DO SISTEMA NUTRICIONAL
## Análise de Conformidade com Planilha Central

### 1. FÓRMULAS DE TMB - ANÁLISE DE DIVERGÊNCIAS

#### 1.1 Harris-Benedict (Atual vs Planilha)
**PLANILHA CENTRAL:**
- Homens: TMB = 66.5 + (13.75 × Peso) + (5.003 × Altura) - (6.75 × Idade)
- Mulheres: TMB = 655.1 + (9.563 × Peso) + (1.850 × Altura) - (4.676 × Idade)

**SISTEMA ATUAL:**
- ❌ DIVERGÊNCIA: Usando Harris-Benedict Revisada com valores diferentes
- ❌ DIVERGÊNCIA: Não implementa a fórmula exata da planilha

#### 1.2 Mifflin-St Jeor (Atual vs Planilha)
**PLANILHA CENTRAL:**
- Homens: TMB = (10 × Peso) + (6.25 × Altura) - (5 × Idade) + 5
- Mulheres: TMB = (10 × Peso) + (6.25 × Altura) - (5 × Idade) - 161

**SISTEMA ATUAL:**
- ✅ CONFORME: Implementado corretamente em alguns módulos
- ❌ DIVERGÊNCIA: Inconsistência na aplicação por perfil

### 2. FATORES DE ATIVIDADE - ANÁLISE DE DIVERGÊNCIAS

**PLANILHA CENTRAL:**
- Sedentário: 1.2
- Levemente Ativo: 1.375  
- Moderadamente Ativo: 1.55
- Muito Ativo: 1.725
- Extremamente Ativo: 1.9

**SISTEMA ATUAL:**
- ✅ CONFORME: Valores corretos implementados
- ❌ DIVERGÊNCIA: Nomenclatura inconsistente entre módulos

### 3. AJUSTES POR OBJETIVO - ANÁLISE DE DIVERGÊNCIAS

**PLANILHA CENTRAL:**
- Manutenção: GET = GEA
- Emagrecimento: GET = GEA - 500 (mín. 1200 kcal)
- Hipertrofia: GET = GEA + 400

**SISTEMA ATUAL:**
- ❌ DIVERGÊNCIA: Valores de ajuste inconsistentes
- ❌ DIVERGÊNCIA: Mínimo de 1200 kcal não sempre aplicado

### 4. DISTRIBUIÇÃO DE MACRONUTRIENTES - ANÁLISE DE DIVERGÊNCIAS

**PLANILHA CENTRAL:**
- Proteína Eutrófico: 1.8 g/kg
- Proteína Obeso/Sobrepeso: 2.0 g/kg
- Proteína Atleta: 2.2 g/kg
- Gordura: 25% do GET (ajustável 20-30%)
- Carboidrato: Por diferença

**SISTEMA ATUAL:**
- ❌ DIVERGÊNCIA: Valores de proteína diferentes (1.2, 2.0, 1.8)
- ❌ DIVERGÊNCIA: Gordura não segue 25% padrão
- ❌ DIVERGÊNCIA: Cálculo por diferença não implementado corretamente

### 5. SELEÇÃO DE FÓRMULAS POR PERFIL - ANÁLISE DE DIVERGÊNCIAS

**PLANILHA CENTRAL:**
- Eutrófico: Harris-Benedict
- Obeso/Sobrepeso: Mifflin-St Jeor  
- Atleta: Harris-Benedict

**SISTEMA ATUAL:**
- ❌ DIVERGÊNCIA: Seleção automática não implementada
- ❌ DIVERGÊNCIA: Usuário escolhe fórmula manualmente

### 6. DISTRIBUIÇÃO POR REFEIÇÃO - ANÁLISE

**PLANILHA CENTRAL:**
- Café da manhã: 25%
- Lanche manhã: 10% 
- Almoço: 30%
- Lanche tarde: 10%
- Jantar: 20%
- Ceia: 5%

**SISTEMA ATUAL:**
- ❌ NÃO IMPLEMENTADO: Sistema de 6 refeições
- ❌ NÃO IMPLEMENTADO: Distribuição percentual automática

## MÓDULOS IDENTIFICADOS PARA CORREÇÃO

1. `src/utils/nutritionCalculations.ts` - Motor principal [PRECISA CORREÇÃO TOTAL]
2. `src/utils/calculations/core.ts` - Sistema secundário [PRECISA ALINHAMENTO]  
3. `src/utils/nutrition/tmbCalculations.ts` - Fórmulas TMB [PRECISA CORREÇÃO]
4. `src/utils/nutrition/macroCalculations.ts` - Macros [PRECISA CORREÇÃO]
5. `src/types/consultation.ts` - Constantes [PRECISA ATUALIZAÇÃO]

## PLANO DE CORREÇÃO

### FASE 1: Criar Motor Nutricional Centralizado
- Implementar todas as fórmulas exatas da planilha
- Centralizar toda lógica em um único módulo
- Garantir seleção automática de fórmulas por perfil

### FASE 2: Corrigir Constantes e Parâmetros  
- Atualizar todos os valores para match exato com planilha
- Implementar distribuição de macros por diferença
- Ajustar fatores de atividade e objetivos

### FASE 3: Sistema de 6 Refeições
- Implementar distribuição automática
- Permitir ajustes manuais
- Calcular macros por refeição

### FASE 4: Migração Segura
- Marcar funções antigas como [DEPRECATED]
- Manter wrappers de compatibilidade
- Testes de regressão completos
