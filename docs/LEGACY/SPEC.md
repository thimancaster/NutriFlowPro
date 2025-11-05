
# Especificação Técnica - Lógica de Distribuição de Macronutrientes

## Objetivo
Implementar no sistema a lógica exata de cálculo de macronutrientes conforme padrão evitando o uso de percentuais fixos arbitrários (como 50% CHO, 25% PTN, 25% LIP) e assegurando a correta individualização conforme o perfil clínico do paciente.

## Lógica Baseada em Peso Corporal (g/kg)

O sistema segue a seguinte ordem lógica:

### 1. Cálculo de Proteínas (PTN) – prioridade máxima

As proteínas são o primeiro macronutriente definido e são calculadas com base no peso corporal atual em g/kg, com valores fixos definidos por tipo de perfil clínico:

| Perfil do Paciente       | PTN (g/kg) |
|--------------------------|------------|
| Eutrófico                | 1.2        |
| Sobrepeso/Obesidade      | 2.0        |
| Atleta / Hipertrofia     | 1.8        |

**Exemplo prático (caso real)**  
Paciente: Jorge Silva  
Peso: 169 kg  
Perfil: Sobrepeso/Obesidade  
PTN = 2.0 g/kg × 169 = 338 g  
Kcal de proteína = 338 g × 4 = 1352 kcal

### 2. Cálculo de Lipídios (LIP) – prioridade secundária

Os lipídios são calculados logo após as proteínas, também com base em g/kg. O valor depende do perfil:

| Perfil do Paciente       | LIP (g/kg) |
|--------------------------|------------|
| Eutrófico                | 0.8        |
| Sobrepeso/Obesidade      | 0.5        |
| Atleta                   | 1.0        |

**Exemplo prático:**  
LIP = 0.5 g/kg × 169 = 84.5 g  
Kcal de lipídios = 84.5 g × 9 = 760.5 kcal

### 3. Cálculo de Carboidratos (CHO) – calculado por diferença

O valor de carboidratos não deve ser fixado previamente. Ele é calculado por diferença, subtraindo-se o valor calórico de proteínas e lipídios do VET (Valor Energético Total) já ajustado para o objetivo (ex: emagrecimento):

```
CHO_kcal = VET - (PTN_kcal + LIP_kcal)
CHO_g = CHO_kcal / 4
```

**Exemplo com VET ajustado para emagrecimento:**  
VET = 2322 kcal  
CHO_kcal = 2322 - (1352 + 760.5) = 209.5 kcal  
CHO = 209.5 / 4 = 52.4 g

### 4. Cálculo dos Percentuais (%) do VET

Após calcular os macronutrientes em kcal, os percentuais são calculados automaticamente como resultado e jamais devem ser entrada do usuário:

```
PTN_% = (PTN_kcal / VET) * 100
LIP_% = (LIP_kcal / VET) * 100
CHO_% = (CHO_kcal / VET) * 100
```

**Exemplo com os valores do caso acima:**  
- PTN = 1352 kcal → 58.2%  
- LIP = 760.5 kcal → 32.7%  
- CHO = 209.5 kcal → 9.0%  

## Implementação

A implementação foi realizada com os seguintes componentes:

1. `src/types/consultation.ts` - Definição de tipos e constantes para os cálculos
2. `src/utils/macronutrientCalculations.ts` - Funções de cálculo de macronutrientes
3. `src/contexts/CalculatorContext.tsx` - Integração com o contexto do calculador
4. `src/hooks/useConsultationForm.ts` - Atualização do hook para usar o novo método de cálculo
5. `src/components/calculator/MacrosByWeight.tsx` - Componente para exibir os cálculos de macronutrientes

## Requisitos Implementados

1. ✓ Entrada de PTN e LIP obrigatoriamente por g/kg (baseado em perfil)
2. ✓ CHO sempre calculado por diferença
3. ✓ O sistema não permite que o usuário defina percentuais manuais diretamente
4. ✓ O campo de % do VET é apenas informativo, preenchido com base no cálculo
5. ✓ O VET é calculado a partir do GET com aplicação do déficit calórico para emagrecimento
6. ✓ As fórmulas de cálculo estão vinculadas ao perfil selecionado
7. ✓ O valor final em kcal por macro e em g bate com a lógica da planilha
