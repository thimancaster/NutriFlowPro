
# Macronutrient Calculation Logic

This document describes the logic for calculating macronutrient distribution based on the scientific approach specified in the requirements.

## Calculation Flow

The macronutrient calculation follows these precise steps:

1. Calculate **Protein** (PTN) first - based on g/kg of body weight
2. Calculate **Lipids** (LIP) second - also based on g/kg of body weight
3. Calculate **Carbohydrates** (CHO) by difference from the VET (total calories)
4. Calculate percentages of VET as an output, not an input

## Protein Calculation (g/kg)

Protein is calculated based on the patient's profile:

| Profile               | PTN (g/kg) |
|-----------------------|------------|
| Eutrófico (normal)    | 1.2        |
| Sobrepeso/Obesidade   | 2.0        |
| Atleta                | 1.8        |

Calculation: `Protein (g) = Weight (kg) × Ratio (g/kg)`

## Lipid Calculation (g/kg)

Lipids are also calculated based on the patient's profile:

| Profile               | LIP (g/kg) |
|-----------------------|------------|
| Eutrófico (normal)    | 0.8        |
| Sobrepeso/Obesidade   | 0.5        |
| Atleta                | 1.0        |

Calculation: `Lipids (g) = Weight (kg) × Ratio (g/kg)`

## Carbohydrate Calculation (by difference)

Carbohydrates are calculated as the remaining calories after protein and lipids:

1. Calculate calories from protein: `Protein (g) × 4 kcal/g`
2. Calculate calories from lipids: `Lipids (g) × 9 kcal/g`
3. Subtract from VET: `CHO_kcal = VET - (PTN_kcal + LIP_kcal)`
4. Convert to grams: `CHO (g) = CHO_kcal ÷ 4 kcal/g`

## Percentage Calculation

The percentages of each macronutrient are calculated as outputs, not inputs:

- `PTN_% = (PTN_kcal / VET) × 100`
- `LIP_% = (LIP_kcal / VET) × 100`
- `CHO_% = (CHO_kcal / VET) × 100`

## Implementation

This logic is implemented in `src/utils/macronutrientCalculations.ts` and integrated into the calculator component to ensure accurate macronutrient calculations based on scientific principles.
