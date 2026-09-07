import { Material, TransportMode, CarbonBreakdown } from '../../src/types.js';

export interface CarbonCalculationParams {
  material: Material;
  packageWeight_g: number;
  transport_distance_km: number;
  transport_mode: TransportMode;
  recyclability_pct: number;
  total_packages?: number;
  baseline_carbon_kg?: number;
}

export function calculateCarbon(params: CarbonCalculationParams): CarbonBreakdown {
  const {
    material,
    packageWeight_g,
    transport_distance_km,
    transport_mode,
    recyclability_pct,
    total_packages = 25000,
    baseline_carbon_kg = 1.35, // Typical virgin plastic/overpackaged benchmark
  } = params;

  const weight_kg = Math.max(0.04, packageWeight_g / 1000);

  // 1. Raw Material Embodied Carbon (kg CO2e)
  const materialCarbon = weight_kg * material.carbon_factor_kg_co2e_per_kg;

  // 2. Manufacturing Processing Energy Carbon (kg CO2e)
  const energyKwhPerKg: Record<string, number> = {
    'Paper & Board': 0.45,
    'Fiber & Pulp': 0.38,
    'Polymer': 1.10,
    'Bio-based': 0.85,
    'Composite': 0.55,
    'Metal & Glass': 1.60,
  };
  const specificEnergy = energyKwhPerKg[material.category] || 0.5;
  const manufacturingCarbon = weight_kg * specificEnergy * 0.65;

  // 3. Transport Logistics Carbon (kg CO2e)
  const freightEmissionsPerKgKm: Record<TransportMode, number> = {
    Road: 0.000105,
    Rail: 0.000032,
    Air: 0.000680,
    Sea: 0.000015,
  };
  const modeEmissionFactor = freightEmissionsPerKgKm[transport_mode] || 0.000105;
  const transportCarbon = weight_kg * transport_distance_km * modeEmissionFactor;

  // 4. End-of-Life Carbon (kg CO2e)
  // Reflects composting, landfill methane, or recycling processing offsets
  const endOfLifeOffset = (weight_kg * (recyclability_pct / 100) * 0.38);
  const endOfLifeCarbon = Math.max(0.02, Number((weight_kg * 0.42 - endOfLifeOffset).toFixed(3)));

  // Total
  const totalCarbonFootprint = Number((materialCarbon + manufacturingCarbon + transportCarbon + endOfLifeCarbon).toFixed(3));
  const totalShipmentCarbon = Number((totalCarbonFootprint * total_packages).toFixed(1));

  // Baseline comparison
  const baseline = baseline_carbon_kg;
  const reductionPct = Number((Math.max(0, ((baseline - totalCarbonFootprint) / baseline) * 100)).toFixed(1));

  return {
    materialCarbon: Number(materialCarbon.toFixed(3)),
    manufacturingCarbon: Number(manufacturingCarbon.toFixed(3)),
    transportCarbon: Number(transportCarbon.toFixed(3)),
    endOfLifeCarbon: Number(endOfLifeCarbon.toFixed(3)),
    totalCarbonFootprint,
    totalShipmentCarbon,
    baselineCarbon: baseline,
    reductionPct,
    isEstimate: true,
    disclaimer: 'ESTIMATE: Calculated using screening LCA emission factors (ISO 14040/14044). Actual footprint requires certified supplier Environmental Product Declarations (EPD).',
  };
}
