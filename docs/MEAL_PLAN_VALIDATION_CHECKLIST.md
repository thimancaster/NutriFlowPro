
# Checklist de Validação - Sistema Consolidado de Plano Alimentar

## ✅ Correções Implementadas

### 1. Padronização meal_type
- [x] Enum único definido em `src/types/mealPlanTypes.ts`
- [x] Valores em português: `cafe_da_manha`, `lanche_manha`, etc.
- [x] RPC `generate_meal_plan_with_cultural_rules` usa valores corretos
- [x] Frontend atualizado para usar valores padronizados

### 2. Serviço Consolidado
- [x] `MealPlanServiceV3` criado como fonte única de verdade
- [x] Hook consolidado `useConsolidatedMealPlan` implementado
- [x] Compatibilidade com sistema de PDF mantida
- [x] Serviços antigos marcados como [DEPRECATED]

### 3. Correção PDF
- [x] Método `convertToPDFFormat` para normalização de dados
- [x] Validação de tipos antes da geração
- [x] Integração com `generateMealPlanPDF` existente
- [x] Funções de download e impressão implementadas

### 4. Componentes Atualizados
- [x] `ConsolidatedMealPlanEditor` criado
- [x] `MealPlanGenerationStep` atualizado
- [x] Compatibilidade com tipos existentes mantida

## 🧪 Testes Necessários

### Teste 1: Geração de Plano
```javascript
// Testar com dados reais
const params = {
  userId: "uuid-do-usuario",
  patientId: "uuid-do-paciente", 
  totalCalories: 2000,
  totalProtein: 150,
  totalCarbs: 200,
  totalFats: 67
};

const result = await MealPlanServiceV3.generateMealPlan(params);
console.log('Plano gerado:', result);
```

### Teste 2: Geração de PDF
```javascript
// Testar geração de PDF
const { downloadPDF } = useConsolidatedMealPlan();
await downloadPDF(mealPlan, "João Silva", 30, "male");
```

### Teste 3: Validação meal_type
```javascript
// Verificar se meal_type está correto no banco
const items = await supabase
  .from('meal_plan_items')
  .select('meal_type')
  .eq('meal_plan_id', 'uuid-do-plano');

// Todos os valores devem ser: cafe_da_manha, lanche_manha, etc.
```

## 🔧 Pontos de Validação Manual

1. **Banco de Dados**
   - [ ] Verificar se novos registros em `meal_plan_items` usam `meal_type` correto
   - [ ] Confirmar que a RPC `generate_meal_plan_with_cultural_rules` está sendo chamada
   - [ ] Validar estrutura JSON em `meal_plans.meals`

2. **Frontend**
   - [ ] Testar geração completa do plano no workflow
   - [ ] Verificar se PDF é gerado sem erros
   - [ ] Confirmar que download e impressão funcionam
   - [ ] Validar exibição das refeições em português

3. **Logs e Erros**
   - [ ] Verificar console logs durante geração
   - [ ] Confirmar que não há erros de tipos TypeScript
   - [ ] Validar que mensagens de sucesso/erro são exibidas

## 🎯 Próximos Passos

1. **Validação Completa**
   - Testar com usuários reais
   - Validar diferentes perfis (eutrófico, obeso, atleta)
   - Confirmar cálculos com planilha de referência

2. **Remoção de Código Legacy**
   - Após validação, remover arquivos [DEPRECATED]
   - Atualizar imports e referências
   - Limpar hooks e serviços não utilizados

3. **Documentação**
   - Atualizar documentação da API
   - Criar guias de uso do novo sistema
   - Documentar processo de migração

## ⚠️ Alertas Importantes

- **NÃO REMOVER** arquivos [DEPRECATED] até validação completa
- **MONITORAR** logs de erro em produção após deploy
- **VALIDAR** com dados reais antes de considerar concluído
- **MANTER** compatibilidade com código existente durante transição

## 📊 Métricas de Sucesso

- [ ] Geração de plano: 100% de sucesso (0 erros)
- [ ] PDF: 100% de geração sem falhas
- [ ] meal_type: 100% dos registros com valores corretos
- [ ] Performance: Tempo de geração < 5 segundos
- [ ] Usuários: 0 reclamações sobre funcionalidade
