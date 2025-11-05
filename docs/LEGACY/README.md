# Documentação Legada - NutriFlow Pro

⚠️ **IMPORTANTE: Esta pasta contém documentos de especificação antigos que foram consolidados.**

## Fonte Única de Verdade (SSOT)

**Consulte sempre o documento mestre para especificações atuais:**  
👉 [`/NUTRIFLOW_PRO_SPEC_V2.0.md`](../../NUTRIFLOW_PRO_SPEC_V2.0.md)

---

## Arquivos Arquivados

Esta pasta contém a documentação histórica do projeto que foi **substituída** pelo documento mestre V2.0:

1. **ARCHITECTURE.md** - Especificação antiga de arquitetura
2. **MACRO_CALCULATION.md** - Lógica de cálculo de macronutrientes (versão antiga)
3. **SPEC.md** - Especificação técnica anterior
4. **ECOSYSTEM_CONSOLIDATION.md** - Documento de consolidação do ecossistema
5. **MEAL_PLAN_DIAGNOSIS.md** - Diagnóstico do sistema de planos alimentares
6. **NutriFlow Pro_ Alinhamento, Coeficiente Comum e Detalhamento de Implementação (V2.0)** - Documento de alinhamento temporário

---

## Status da Documentação

| Documento | Status | Substituído Por |
|-----------|--------|-----------------|
| ARCHITECTURE.md | ❌ Obsoleto | NUTRIFLOW_PRO_SPEC_V2.0.md (Seção 1 e 6) |
| MACRO_CALCULATION.md | ❌ Obsoleto | NUTRIFLOW_PRO_SPEC_V2.0.md (Seção 2) |
| SPEC.md | ❌ Obsoleto | NUTRIFLOW_PRO_SPEC_V2.0.md (Completo) |
| ECOSYSTEM_CONSOLIDATION.md | ❌ Obsoleto | NUTRIFLOW_PRO_SPEC_V2.0.md (Seção 3) |
| MEAL_PLAN_DIAGNOSIS.md | ❌ Obsoleto | NUTRIFLOW_PRO_SPEC_V2.0.md (Seção 4) |

---

## Por Que Estes Documentos Foram Arquivados?

### Problemas com Documentação Fragmentada:

1. **Inconsistências:** Múltiplos documentos continham especificações conflitantes (ex: coeficientes de Harris-Benedict diferentes)
2. **Duplicação:** Mesmas informações repetidas em vários arquivos
3. **Confusão:** Desenvolvedores não sabiam qual documento era a "fonte da verdade"
4. **Desatualização:** Alguns documentos não refletiam o estado atual do código

### Solução: Documento Mestre Único (SSOT)

O `NUTRIFLOW_PRO_SPEC_V2.0.md` consolidou e corrigiu todas as especificações, estabelecendo uma única fonte de verdade.

---

## Como Usar Esta Documentação Legada

### ✅ Usos Válidos:
- **Referência histórica:** Entender decisões de design anteriores
- **Comparação:** Verificar o que mudou entre versões
- **Auditoria:** Rastrear evolução do projeto

### ❌ NÃO Use Para:
- **Implementação de novas funcionalidades** → Use NUTRIFLOW_PRO_SPEC_V2.0.md
- **Referência de fórmulas de cálculo** → Use NUTRIFLOW_PRO_SPEC_V2.0.md
- **Definição de arquitetura** → Use NUTRIFLOW_PRO_SPEC_V2.0.md

---

## Divergências Críticas Corrigidas no V2.0

### 1. Fórmulas de TMB
**Antes (MACRO_CALCULATION.md):**
```
Harris-Benedict (Homens): 66 + (13.8 × P) + (5.0 × A) - (6.8 × I)
```

**Agora (V2.0 - CORRETO):**
```
Harris-Benedict Revisada (Homens): 66.5 + (13.75 × P) + (5.003 × A) - (6.75 × I)
```

### 2. Valores de PTN (g/kg)
**Antes (SPEC.md):**
- Eutrófico: 1.2 g/kg

**Agora (V2.0 - CORRETO):**
- Eutrófico: 1.8 g/kg

### 3. Fatores de Atividade
**Antes (ARCHITECTURE.md):**
- Fatores únicos para todos os perfis

**Agora (V2.0 - CORRETO):**
- Fatores diferenciados para Eutróficos vs Obesos/Sobrepeso

---

## Notas de Migração

Se você está trabalhando em código que referenciava estes documentos antigos:

1. **Atualize seus bookmarks** para apontar para `/NUTRIFLOW_PRO_SPEC_V2.0.md`
2. **Revise cálculos** implementados antes de 2025-11-05 para garantir alinhamento com V2.0
3. **Verifique constantes** em `src/types/consultation.ts` para usar valores atualizados

---

**Data de Arquivamento:** 2025-11-05  
**Versão do Documento Mestre:** 2.0  
**Mantido por:** Equipe NutriFlow Pro

---

Para dúvidas sobre especificações atuais, consulte:  
📄 [`/NUTRIFLOW_PRO_SPEC_V2.0.md`](../../NUTRIFLOW_PRO_SPEC_V2.0.md)
