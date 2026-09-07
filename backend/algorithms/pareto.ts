import { PackagingDesign, ParetoPoint } from '../../src/types.js';

export function computeParetoFrontier(
  designs: Array<{ design: PackagingDesign; score?: number }>
): ParetoPoint[] {
  const points: ParetoPoint[] = designs.map(item => ({
    id: item.design.id,
    name: item.design.name,
    material: item.design.material_name,
    cost: item.design.estimated_cost,
    carbon: item.design.carbon_footprint,
    protection: item.design.protection_score,
    sustainability: item.design.sustainability_score || item.design.recyclability || 85,
    score: item.score || Math.round(item.design.protection_score * 0.5 + item.design.recyclability * 0.5),
    isParetoOptimal: true,
  }));

  // Standard Pareto dominance check:
  // For cost and carbon (we want to MINIMIZE both)
  // Solution A dominates Solution B if:
  // cost(A) <= cost(B) && carbon(A) <= carbon(B) && (cost(A) < cost(B) || carbon(A) < carbon(B))
  // However, protection is also a factor (higher is better), so we evaluate dominance in (Cost, Carbon, Protection)
  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      const pA = points[j]; // potential dominator
      const pB = points[i]; // candidate being evaluated

      // Does pA dominate pB?
      const betterOrEqualCost = pA.cost <= pB.cost;
      const betterOrEqualCarbon = pA.carbon <= pB.carbon;
      const betterOrEqualProt = pA.protection >= pB.protection;

      const strictlyBetter =
        pA.cost < pB.cost ||
        pA.carbon < pB.carbon ||
        pA.protection > pB.protection;

      if (betterOrEqualCost && betterOrEqualCarbon && betterOrEqualProt && strictlyBetter) {
        // pB is dominated!
        points[i].isParetoOptimal = false;
        break;
      }
    }
  }

  // Always ensure at least 2 key trade-off anchors are highlighted on frontier
  // e.g. lowest cost option and lowest carbon option are mathematically non-dominated on single axes
  const minCostPoint = points.reduce((prev, curr) => (curr.cost < prev.cost ? curr : prev), points[0]);
  const minCarbonPoint = points.reduce((prev, curr) => (curr.carbon < prev.carbon ? curr : prev), points[0]);
  if (minCostPoint) minCostPoint.isParetoOptimal = true;
  if (minCarbonPoint) minCarbonPoint.isParetoOptimal = true;

  // Sort by Cost ascending for clean line plotting
  return points.sort((a, b) => a.cost - b.cost);
}
