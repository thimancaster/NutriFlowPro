# 🔍 AUDIT REPORT: NutriFlow vs Official Nutrition Spreadsheet

## Executive Summary
**CRITICAL DEVIATIONS FOUND** - NutriFlow contains multiple inconsistencies with the official spreadsheet specification, requiring immediate corrections to ensure calculation accuracy.

---

## 🚨 CRITICAL FINDINGS

### 1. **EQUATION IMPLEMENTATION ERRORS**

#### ❌ Harris-Benedict Formula Deviation
**SPECIFICATION:**
- **Women:** TMB = 655 + (9.6 × weight) + (1.8 × height) – (4.7 × age)
- **Men:** TMB = 66 + (13.7 × weight) + (5.0 × height) – (6.8 × age)

**CURRENT IMPLEMENTATION** (Multiple versions found):
```typescript
// Version 1: enp/core.ts (Harris-Benedict Revised)
if (sex === 'M') {
  return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
} else {
  return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
}

// Version 2: centralMotor/enpCore.ts
if (gender === 'M') {
  return 66.5 + (13.75 * weight) + (5.003 * height) - (6.75 * age);
} else {
  return 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
}
```

**IMPACT:** Calculations will produce incorrect TMB values, affecting all downstream calculations (GET, VET, macros).

#### ❌ Missing Tinsley Equation
**SPECIFICATION:** Athletes should use Tinsley equation (weight-only formula)
**CURRENT:** Not implemented anywhere in the codebase
**IMPACT:** Athletes are getting incorrect TMB calculations

### 2. **MACRONUTRIENT DISTRIBUTION LOGIC ERRORS**

#### ❌ Fixed Ratios vs Manual Input
**SPECIFICATION:**
- Users manually input: **Protein (g/kg)** and **Fat (g/kg)**
- **Carbohydrate calculated automatically** as leftover energy

**CURRENT IMPLEMENTATION:**
```typescript
// Fixed ratios per profile - INCORRECT
export const PROTEIN_RATIOS: Record<Profile, number> = {
  eutrofico: 1.8,
  sobrepeso_obesidade: 2.0, 
  atleta: 2.2
};

export const LIPID_RATIOS: Record<Profile, number> = {
  eutrofico: 0.8,
  sobrepeso_obesidade: 0.5,
  atleta: 1.0
};
```

**IMPACT:** System doesn't allow manual macro input as specified, reducing nutritionist flexibility.

### 3. **CALCULATION FLOW INCONSISTENCIES**

#### ❌ Multiple Calculation Systems
**FOUND:** 3+ different calculation systems:
- `enp/core.ts` 
- `centralMotor/enpCore.ts`
- `gerCalculations.ts`
- Legacy systems in various files

**IMPACT:** Inconsistent results depending on code path, potential calculation errors.

#### ❌ Activity Factor Application
**SPECIFICATION:** Activity factor applied after TMB: GET = TMB × FA
**CURRENT:** ✅ Correctly implemented
```typescript
export function calculateGEA_ENP(tmb: number, activityLevel: ActivityLevel): number {
  const factors = { sedentario: 1.2, leve: 1.375, moderado: 1.55, intenso: 1.725, muito_intenso: 1.9 };
  return Math.round(tmb * factors[activityLevel]);
}
```

### 4. **MEAL DISTRIBUTION VALIDATION**

#### ⚠️ Percentage Totals Not Validated
**SPECIFICATION:** Total must always equal 100%
**CURRENT:** 
```typescript
export const DEFAULT_MEAL_DISTRIBUTION: Record<MealType, number> = {
  breakfast: 25,     // 25%
  morning_snack: 10, // 10% 
  lunch: 35,         // 35%
  afternoon_snack: 10, // 10%
  dinner: 15,        // 15%
  evening_snack: 5   // 5%
}; // TOTAL = 100% ✅
```

**STATUS:** ✅ Default distribution correct, but needs runtime validation

---

## 🔧 REQUIRED CORRECTIONS

### Priority 1: Critical Formula Fixes

#### 1.1 Implement Correct Harris-Benedict
```typescript
// CORRECT IMPLEMENTATION
export function calculateTMB_HarrisBenedict_Official(
  weight: number, height: number, age: number, sex: 'M' | 'F'
): number {
  if (sex === 'M') {
    return 66 + (13.7 * weight) + (5.0 * height) - (6.8 * age);
  } else {
    return 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
  }
}
```

#### 1.2 Implement Missing Tinsley Equation
```typescript
// NEW IMPLEMENTATION REQUIRED
export function calculateTMB_Tinsley(weight: number, sex: 'M' | 'F'): number {
  // Same formula for men and women - WEIGHT ONLY
  return [FORMULA_PLACEHOLDER]; // Need exact formula from specification
}
```

#### 1.3 Formula Selection Logic
```typescript
export function selectTMBFormula(profile: Profile): 'harris_benedict' | 'obesity' | 'tinsley' {
  switch (profile) {
    case 'eutrofico': return 'harris_benedict';
    case 'sobrepeso_obesidade': return 'obesity'; // Specify which formula
    case 'atleta': return 'tinsley';
    default: return 'harris_benedict';
  }
}
```

### Priority 2: Manual Macro Input System

#### 2.1 Replace Fixed Ratios with User Input
```typescript
interface MacroInputs {
  proteinPerKg: number; // User-defined g/kg
  fatPerKg: number;     // User-defined g/kg
  // carbs calculated automatically
}

export function calculateMacros_Manual(
  vet: number, weight: number, macroInputs: MacroInputs
): MacroResult {
  const proteinGrams = macroInputs.proteinPerKg * weight;
  const proteinKcal = proteinGrams * 4;
  
  const fatGrams = macroInputs.fatPerKg * weight;
  const fatKcal = fatGrams * 9;
  
  // AUTOMATIC CARB CALCULATION (by difference)
  const carbsKcal = vet - proteinKcal - fatKcal;
  const carbsGrams = Math.max(0, carbsKcal / 4);
  
  return { protein: {...}, carbs: {...}, fat: {...} };
}
```

### Priority 3: System Consolidation

#### 3.1 Single Source of Truth
- **REMOVE:** All duplicate calculation systems
- **KEEP:** One unified system following official specification
- **IMPLEMENT:** Central validation for all calculations

#### 3.2 Meal Distribution Validation
```typescript
export function validateMealDistribution(distribution: Record<string, number>): boolean {
  const total = Object.values(distribution).reduce((sum, percent) => sum + percent, 0);
  return Math.abs(total - 100) < 0.01; // Allow tiny floating point errors
}
```

---

## 🧪 VALIDATION TESTS REQUIRED

### 1. Formula Accuracy Tests
```typescript
describe('TMB Calculations', () => {
  it('Harris-Benedict matches specification exactly', () => {
    // Men: 70kg, 175cm, 30 years = 66 + (13.7*70) + (5*175) - (6.8*30) = 1741
    expect(calculateTMB_HarrisBenedict_Official(70, 175, 30, 'M')).toBe(1741);
    
    // Women: 60kg, 165cm, 25 years = 655 + (9.6*60) + (1.8*165) - (4.7*25) = 1344.5
    expect(calculateTMB_HarrisBenedict_Official(60, 165, 25, 'F')).toBe(1344.5);
  });
});
```

### 2. Macro Distribution Tests
```typescript
describe('Macro Calculations', () => {
  it('carbohydrates calculated by difference correctly', () => {
    const vet = 2000;
    const weight = 70;
    const macroInputs = { proteinPerKg: 1.6, fatPerKg: 1.0 };
    
    const result = calculateMacros_Manual(vet, weight, macroInputs);
    
    // Protein: 70*1.6 = 112g = 448kcal
    // Fat: 70*1.0 = 70g = 630kcal  
    // Carbs: (2000-448-630)/4 = 230.5g
    expect(result.carbs.grams).toBeCloseTo(230.5, 1);
  });
});
```

### 3. End-to-End Workflow Tests
```typescript
describe('Complete Calculation Flow', () => {
  it('follows exact specification order: TMB → FA → GET → VET → Macros', () => {
    const inputs = { weight: 70, height: 175, age: 30, sex: 'M', profile: 'eutrofico' };
    
    // Step 1: TMB
    const tmb = calculateTMB_HarrisBenedict_Official(inputs.weight, inputs.height, inputs.age, inputs.sex);
    
    // Step 2: Apply Activity Factor  
    const get = tmb * 1.55; // Moderate activity
    
    // Step 3: Apply Objective Adjustment
    const vet = get + 0; // Maintenance = no adjustment
    
    // Step 4: Calculate Macros
    const macros = calculateMacros_Manual(vet, inputs.weight, { proteinPerKg: 1.6, fatPerKg: 1.0 });
    
    // Verify consistency
    const totalKcal = macros.protein.kcal + macros.carbs.kcal + macros.fat.kcal;
    expect(totalKcal).toBeCloseTo(vet, 1);
  });
});
```

---

## 📋 ACTION ITEMS

### Immediate (Critical)
1. ✅ **Fix Harris-Benedict formula** in all calculation files
2. ✅ **Implement Tinsley equation** for athletes
3. ✅ **Remove duplicate calculation systems** - use single source
4. ✅ **Add manual macro input interface** replacing fixed ratios

### Short Term
1. ✅ **Implement comprehensive validation tests**
2. ✅ **Add meal distribution validation (100% check)**
3. ✅ **Create equation selection logic** based on patient profile
4. ✅ **Audit all existing calculations** for data integrity

### Long Term
1. ✅ **Create admin interface** for formula verification
2. ✅ **Add calculation history** with formula tracking
3. ✅ **Implement A/B testing** for formula accuracy
4. ✅ **Documentation update** with official specifications

---

## 🎯 SUCCESS CRITERIA

**System passes audit when:**
1. Harris-Benedict formulas match specification exactly
2. Tinsley equation implemented for athletes
3. Manual macro input replaces fixed ratios
4. Single, consistent calculation system
5. All meal distributions validate to 100%
6. Comprehensive test coverage (>95%)
7. Zero calculation inconsistencies between code paths

**ESTIMATED IMPACT:** High - Affects all nutritional calculations and meal plans generated by the system.

**RECOMMENDED TIMELINE:** 2-3 sprints for complete implementation and validation.