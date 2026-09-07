import { Material, TransportMode, CostBreakdown } from '../../src/types.js';

export interface CostCalculationParams {
  material: Material;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  thickness_mm: number;
  cushioning_mm: number;
  packageWeight_g?: number;
  transport_distance_km: number;
  transport_mode: TransportMode;
  annual_quantity?: number;
  expected_volume?: number;
  baseline_cost_per_package?: number;
}

export function calculateCost(params: CostCalculationParams): CostBreakdown {
  const {
    material,
    length_mm,
    width_mm,
    height_mm,
    thickness_mm,
    cushioning_mm,
    transport_distance_km,
    transport_mode,
    annual_quantity = 25000,
    expected_volume = 25000,
    baseline_cost_per_package = 24.50, // Typical unoptimized virgin packaging benchmark
  } = params;

  const volume = annual_quantity || expected_volume || 25000;

  // Outer dimensions including cushioning and wall thickness
  const outerL = length_mm + 2 * (cushioning_mm + thickness_mm);
  const outerW = width_mm + 2 * (cushioning_mm + thickness_mm);
  const outerH = height_mm + 2 * (cushioning_mm + thickness_mm);

  // Surface area in m²
  const surfaceArea_m2 = 2 * ((outerL * outerW) + (outerW * outerH) + (outerL * outerH)) / 1000000;
  const surfaceArea_cm2 = surfaceArea_m2 * 10000;
  const thickness_cm = thickness_mm / 10;
  const shellVolume_cm3 = surfaceArea_cm2 * thickness_cm;

  // Cushioning volume
  const innerProductVolume_cm3 = (length_mm * width_mm * height_mm) / 1000;
  const innerCavityVolume_cm3 = ((length_mm + 2 * cushioning_mm) * (width_mm + 2 * cushioning_mm) * (height_mm + 2 * cushioning_mm)) / 1000;
  const cushionVolume_cm3 = Math.max(0, innerCavityVolume_cm3 - innerProductVolume_cm3);

  // Shell & cushion weights
  const cushionWeight_g = Math.min(180, cushionVolume_cm3 * 0.024);
  const shellWeight_g = Math.min(600, shellVolume_cm3 * material.density_g_cm3);
  const totalPackageWeight_g = params.packageWeight_g || (shellWeight_g + cushionWeight_g);
  const totalWeight_kg = Math.max(0.05, totalPackageWeight_g / 1000);

  // Economies of scale discount
  const volumeDiscount = volume >= 50000 ? 0.86 : volume >= 20000 ? 0.92 : 1.0;

  // 1. Material Cost (₹)
  const rawMaterialCost = Number(((shellWeight_g / 1000) * material.cost_per_kg * volumeDiscount).toFixed(2));

  // 2. Manufacturing & Tooling Cost (₹)
  let complexityMultiplier = 1.0;
  if (material.category === 'Fiber & Pulp') complexityMultiplier = 1.15;
  else if (material.category === 'Composite') complexityMultiplier = 1.25;
  else if (material.category === 'Polymer') complexityMultiplier = 1.30;
  else if (material.category === 'Bio-based') complexityMultiplier = 1.35;
  else if (material.category === 'Metal & Glass') complexityMultiplier = 1.50;

  const toolingAmortization = Number((18000 / volume).toFixed(2));
  const machineEnergy = Number((totalWeight_kg * 8.5 * complexityMultiplier).toFixed(2));
  const manufacturingCost = Number((Math.max(1.2, (toolingAmortization + machineEnergy) * volumeDiscount)).toFixed(2));

  // 3. Printing Cost (₹)
  // Water-based flexo / soy inks, 2-color brand mark
  const printingCost = Number((Math.max(0.65, 0.85 * volumeDiscount)).toFixed(2));

  // 4. Assembly & Labor Cost (₹)
  // Folding and sealing cycle time (automated vs semi-manual)
  const assemblyCost = Number((Math.max(0.50, 0.75 * (thickness_mm > 3.0 ? 1.1 : 0.95))).toFixed(2));

  // 5. Cushioning Cost (₹)
  const cushioningCost = Number((Math.max(0.80, (cushionWeight_g / 1000) * 55 * volumeDiscount)).toFixed(2));

  // 6. Transportation Cost (₹ per package)
  const modeRatePerKgKm: Record<TransportMode, number> = {
    Road: 0.0065,
    Rail: 0.0028,
    Air: 0.0380,
    Sea: 0.0016,
  };
  const transportRate = modeRatePerKgKm[transport_mode] || 0.0065;
  const transportCost = Number(((transport_distance_km * totalWeight_kg * transportRate) + 0.45).toFixed(2));

  // Total
  const totalCost = Number((rawMaterialCost + manufacturingCost + printingCost + assemblyCost + cushioningCost + transportCost).toFixed(2));
  const annualCost = Math.round(totalCost * volume);

  // Savings against baseline
  const benchmarkCost = baseline_cost_per_package;
  const savingsPerPackage = Number(Math.max(0, benchmarkCost - totalCost).toFixed(2));
  const annualSavings = Math.round(savingsPerPackage * volume);
  const savingsPct = Number(((savingsPerPackage / benchmarkCost) * 100).toFixed(1));

  const calculationExplanation = `Formula: Total = Material (₹${rawMaterialCost}) + Manufacturing (₹${manufacturingCost}) + Printing (₹${printingCost}) + Assembly (₹${assemblyCost}) + Cushioning (₹${cushioningCost}) + Transport (₹${transportCost}). Calculated for ${volume.toLocaleString()} units with ${transport_distance_km}km ${transport_mode} transit.`;

  return {
    materialCost: rawMaterialCost,
    manufacturingCost,
    printingCost,
    assemblyCost,
    cushioningCost,
    transportCost,
    totalCost,
    annualCost,
    savingsPerPackage,
    annualSavings,
    savingsPct,
    calculationExplanation,
  };
}
