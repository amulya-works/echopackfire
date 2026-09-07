import { PackagingDesign, ScenarioWeights, ScenarioConstraints, ScenarioSimulationResult } from '../../src/types.js';
import { calculateMultiObjectiveScore } from '../algorithms/scoring.js';
import { recalculatePackagingMetrics } from './packagingService.js';

export interface ScenarioSimulationRequest {
  scenarioName?: string;
  projectId: string;
  designs: PackagingDesign[];
  weights: ScenarioWeights;
  constraints: ScenarioConstraints;
  previousBestId?: string;
}

export function simulateScenario(
  request: ScenarioSimulationRequest
): ScenarioSimulationResult {
  const { scenarioName, designs, weights, constraints, previousBestId } = request;

  // If transport distance differs from baseline, recalculate designs with adjusted logistics cost & carbon
  const updatedDesigns: PackagingDesign[] = designs.map(d => {
    const updated = recalculatePackagingMetrics({
      material_id: d.material_id,
      length_mm: d.length_mm - (2 * d.cushioning_mm),
      width_mm: d.width_mm - (2 * d.cushioning_mm),
      height_mm: d.height_mm - (2 * d.cushioning_mm),
      thickness_mm: d.thickness_mm,
      cushioning_mm: d.cushioning_mm,
      transport_distance_km: constraints.transport_distance_km,
    });

    return {
      ...d,
      estimated_cost: updated.estimated_cost,
      carbon_footprint: updated.carbon_footprint,
      protection_score: updated.protection_score,
      recyclability: updated.recyclability,
      logistics_score: updated.logistics_score,
      brand_score: updated.brand_score,
    };
  });

  // Calculate multi-objective scores
  const scored = calculateMultiObjectiveScore(updatedDesigns, weights);

  // Apply constraints
  const ranked = scored.map(item => {
    const d = item.design;
    const reasons: string[] = [];

    if (constraints.budget && d.estimated_cost > constraints.budget) {
      reasons.push(`Exceeds budget of ₹${constraints.budget.toFixed(2)} (Cost: ₹${d.estimated_cost.toFixed(2)})`);
    }
    if (constraints.carbon_target && d.carbon_footprint > constraints.carbon_target) {
      reasons.push(`Exceeds carbon limit of ${constraints.carbon_target} kg CO₂e (Footprint: ${d.carbon_footprint} kg)`);
    }
    if (constraints.min_protection && d.protection_score < constraints.min_protection) {
      reasons.push(`Protection rating ${d.protection_score} is below minimum requirement of ${constraints.min_protection}`);
    }
    if (constraints.min_recyclability && d.recyclability < constraints.min_recyclability) {
      reasons.push(`Recyclability ${d.recyclability}% is below target of ${constraints.min_recyclability}%`);
    }

    const isFeasible = reasons.length === 0;

    return {
      design: d,
      finalScore: isFeasible ? item.finalScore : Math.max(10, item.finalScore - 30),
      componentScores: item.componentScores,
      isFeasible,
      rejectionReason: reasons.join('; '),
    };
  });

  // Sort by feasible first, then by final score descending
  ranked.sort((a, b) => {
    if (a.isFeasible && !b.isFeasible) return -1;
    if (!a.isFeasible && b.isFeasible) return 1;
    return b.finalScore - a.finalScore;
  });

  const bestOption = ranked[0]?.design || updatedDesigns[0];
  const previousBestOption = previousBestId
    ? updatedDesigns.find(d => d.id === previousBestId)
    : undefined;

  return {
    scenarioName: scenarioName || 'Custom Scenario',
    weights,
    constraints,
    rankedDesigns: ranked,
    bestOption,
    previousBestOption,
  };
}

export const PRESET_SCENARIOS = {
  'GREEN_FIRST': {
    name: 'Green-First Sustainability Focus',
    description: 'Prioritize lowest lifecycle carbon footprint and maximal circular recyclability.',
    weights: { sustainability: 55, protection: 25, cost: 10, logistics: 5, brand: 5 },
    constraints: { transport_distance_km: 500, budget: 22, carbon_target: 0.85, min_protection: 80, min_recyclability: 90 },
  },
  'COST_FIRST': {
    name: 'Cost-First Margin Optimization',
    description: 'Minimize packaging unit cost while respecting essential product safety thresholds.',
    weights: { sustainability: 10, protection: 30, cost: 50, logistics: 5, brand: 5 },
    constraints: { transport_distance_km: 500, budget: 16, carbon_target: 1.6, min_protection: 75, min_recyclability: 70 },
  },
  'PROTECTION_FIRST': {
    name: 'Protection-First Zero Damage',
    description: 'Maximize impact cushioning and shock damping for high-fragility cargo.',
    weights: { sustainability: 15, protection: 60, cost: 10, logistics: 10, brand: 5 },
    constraints: { transport_distance_km: 500, budget: 24, carbon_target: 1.5, min_protection: 92, min_recyclability: 75 },
  },
  'LOGISTICS_SHOCK': {
    name: 'Logistics Distance Shock (+200% km)',
    description: 'Transport distance expands from 500 km to 1,500 km, heavily weighting tare weight and cube efficiency.',
    weights: { sustainability: 25, protection: 25, cost: 20, logistics: 25, brand: 5 },
    constraints: { transport_distance_km: 1500, budget: 25, carbon_target: 1.3, min_protection: 82, min_recyclability: 80 },
  },
  'MATERIAL_PRICE_SHOCK': {
    name: 'Material Inflation Shock (+25%)',
    description: 'Supply chain raw material prices surge by 25%, penalizing dense and heavy materials.',
    weights: { sustainability: 20, protection: 25, cost: 40, logistics: 10, brand: 5 },
    constraints: { transport_distance_km: 500, budget: 20, carbon_target: 1.2, min_protection: 80, min_recyclability: 80 },
  },
  'CARBON_TARGET': {
    name: 'Strict Corporate Carbon Cap',
    description: 'Strict ESG audit constraint capping packaging carbon at 0.75 kg CO₂e.',
    weights: { sustainability: 50, protection: 25, cost: 15, logistics: 5, brand: 5 },
    constraints: { transport_distance_km: 500, budget: 22, carbon_target: 0.75, min_protection: 78, min_recyclability: 85 },
  },
};
