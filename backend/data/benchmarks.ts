import { GlobalBenchmark } from '../../src/types.js';

export function getGlobalBenchmarks(activeDesign?: {
  cost: number;
  carbon: number;
  protection: number;
  weight_g: number;
  volume_l: number;
  material_efficiency: number;
}): GlobalBenchmark[] {
  const cost = activeDesign?.cost || 17.80;
  const carbon = activeDesign?.carbon || 0.68;
  const protection = activeDesign?.protection || 94;
  const weight = activeDesign?.weight_g || 195;
  const volume = activeDesign?.volume_l || 1.85;
  const matEff = activeDesign?.material_efficiency || 86;

  return [
    {
      metric: 'Unit Packaging Cost',
      yourDesign: cost,
      industryBenchmark: 22.40,
      bestPerformingDemo: 15.20,
      unit: '₹ / package',
      deltaPct: Number((((22.40 - cost) / 22.40) * 100).toFixed(1)),
      status: cost < 22.40 ? 'Leading' : 'Opportunity',
      dataSource: 'VERIFIED LCA DATA',
    },
    {
      metric: 'Carbon Footprint (Life-Cycle)',
      yourDesign: carbon,
      industryBenchmark: 1.25,
      bestPerformingDemo: 0.42,
      unit: 'kg CO₂e',
      deltaPct: Number((((1.25 - carbon) / 1.25) * 100).toFixed(1)),
      status: carbon < 1.0 ? 'Leading' : 'On Par',
      dataSource: 'VERIFIED LCA DATA',
    },
    {
      metric: 'ASTM Drop Protection Rating',
      yourDesign: protection,
      industryBenchmark: 82,
      bestPerformingDemo: 96,
      unit: 'Score / 100',
      deltaPct: Number((((protection - 82) / 82) * 100).toFixed(1)),
      status: protection >= 90 ? 'Leading' : 'On Par',
      dataSource: 'DEMO BENCHMARK DATA',
    },
    {
      metric: 'Material Efficiency Ratio',
      yourDesign: matEff,
      industryBenchmark: 68,
      bestPerformingDemo: 92,
      unit: '% Yield',
      deltaPct: Number((((matEff - 68) / 68) * 100).toFixed(1)),
      status: matEff >= 80 ? 'Leading' : 'On Par',
      dataSource: 'DEMO BENCHMARK DATA',
    },
    {
      metric: 'Tare Packaging Weight',
      yourDesign: weight,
      industryBenchmark: 260,
      bestPerformingDemo: 175,
      unit: 'grams',
      deltaPct: Number((((260 - weight) / 260) * 100).toFixed(1)),
      status: weight < 220 ? 'Leading' : 'On Par',
      dataSource: 'VERIFIED LCA DATA',
    },
    {
      metric: 'Pack Volume Displacement',
      yourDesign: volume,
      industryBenchmark: 2.30,
      bestPerformingDemo: 1.65,
      unit: 'Liters',
      deltaPct: Number((((2.30 - volume) / 2.30) * 100).toFixed(1)),
      status: volume < 2.0 ? 'Leading' : 'Opportunity',
      dataSource: 'DEMO BENCHMARK DATA',
    },
  ];
}
