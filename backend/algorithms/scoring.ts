import { PackagingDesign, ScenarioWeights } from '../../src/types.js';

export interface ComponentScores {
  sustainabilityScore: number;
  protectionScore: number;
  costScore: number;
  logisticsScore: number;
  brandScore: number;
}

export interface ScoredCandidate {
  design: PackagingDesign;
  finalScore: number;
  componentScores: ComponentScores;
}

export function calculateMultiObjectiveScore(
  designs: PackagingDesign[],
  weights: ScenarioWeights
): ScoredCandidate[] {
  if (!designs.length) return [];

  // Total weight normalization to 100%
  const totalWeight =
    (weights.sustainability || 0) +
    (weights.protection || 0) +
    (weights.cost || 0) +
    (weights.logistics || 0) +
    (weights.brand || 0) || 100;

  const wSust = (weights.sustainability || 0) / totalWeight;
  const wProt = (weights.protection || 0) / totalWeight;
  const wCost = (weights.cost || 0) / totalWeight;
  const wLog = (weights.logistics || 0) / totalWeight;
  const wBrand = (weights.brand || 0) / totalWeight;

  // Find min and max for relative scaling across pool
  const costs = designs.map(d => d.estimated_cost);
  const carbons = designs.map(d => d.carbon_footprint);
  const protections = designs.map(d => d.protection_score);
  const recyclabilities = designs.map(d => d.recyclability);

  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs) || minCost + 1;

  const minCarbon = Math.min(...carbons);
  const maxCarbon = Math.max(...carbons) || minCarbon + 0.1;

  return designs.map(design => {
    // 1. Cost Score (inverted: lowest cost gets 100, highest cost gets 30)
    const costRange = maxCost - minCost;
    const costScore = costRange > 0
      ? 100 - ((design.estimated_cost - minCost) / costRange) * 70
      : 85;

    // 2. Sustainability Score (combination of low carbon and high recyclability)
    const carbonRange = maxCarbon - minCarbon;
    const carbonRelativeScore = carbonRange > 0
      ? 100 - ((design.carbon_footprint - minCarbon) / carbonRange) * 60
      : 85;
    const recyclabilityScore = design.recyclability; // 0-100
    const sustainabilityScore = Math.round((carbonRelativeScore * 0.6) + (recyclabilityScore * 0.4));

    // 3. Protection Score
    const protectionScore = design.protection_score;

    // 4. Logistics Score
    const logisticsScore = design.logistics_score || 80;

    // 5. Brand Score
    const brandScore = design.brand_score || 85;

    // Multi-objective weighted sum
    const rawFinalScore =
      sustainabilityScore * wSust +
      protectionScore * wProt +
      costScore * wCost +
      logisticsScore * wLog +
      brandScore * wBrand;

    const finalScore = Number(Math.min(99, Math.max(20, Math.round(rawFinalScore))));

    return {
      design,
      finalScore,
      componentScores: {
        sustainabilityScore: Math.round(sustainabilityScore),
        protectionScore: Math.round(protectionScore),
        costScore: Math.round(costScore),
        logisticsScore: Math.round(logisticsScore),
        brandScore: Math.round(brandScore),
      },
    };
  });
}
