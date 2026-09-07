import { LogisticsMetrics, TransportMode } from '../../src/types.js';

export interface LogisticsParams {
  length_mm: number;
  width_mm: number;
  height_mm: number;
  package_weight_g: number;
  number_of_packages: number;
  transport_distance_km: number;
  transport_mode: TransportMode;
  baseline_length_mm?: number;
  baseline_width_mm?: number;
  baseline_height_mm?: number;
}

export function calculateLogistics(params: LogisticsParams): LogisticsMetrics {
  const {
    length_mm,
    width_mm,
    height_mm,
    package_weight_g,
    number_of_packages = 25000,
    transport_distance_km = 500,
    transport_mode = 'Road',
    baseline_length_mm = length_mm * 1.18,
    baseline_width_mm = width_mm * 1.18,
    baseline_height_mm = height_mm * 1.15,
  } = params;

  // Standard intermodal 53-foot dry van truck payload:
  // Internal dimensions: 16.15m L x 2.49m W x 2.74m H = ~110 m³ usable volume
  // Weight capacity: ~20,000 kg (20 metric tonnes)
  const truckUsableVolume_m3 = 98.0; // accounting for 89% packing factor
  const container20ftVolume_m3 = 28.0;

  // Individual package volume
  const package_volume_l = Number(((length_mm * width_mm * height_mm) / 1000000).toFixed(2));
  const package_volume_m3 = package_volume_l / 1000;

  // Shipment totals
  const shipment_volume_m3 = Number((package_volume_m3 * number_of_packages).toFixed(1));
  const shipment_weight_kg = Number(((package_weight_g / 1000) * number_of_packages).toFixed(1));

  // Capacity calculation
  const packages_per_truck = Math.floor(truckUsableVolume_m3 / Math.max(0.0005, package_volume_m3));
  const packages_per_container = Math.floor(container20ftVolume_m3 / Math.max(0.0005, package_volume_m3));

  // Baseline package metrics for comparison
  const baseline_vol_l = (baseline_length_mm * baseline_width_mm * baseline_height_mm) / 1000000;
  const baseline_packages_per_truck = Math.floor(truckUsableVolume_m3 / Math.max(0.0005, (baseline_vol_l / 1000)));

  const improvement_pct = Number(
    (((packages_per_truck - baseline_packages_per_truck) / Math.max(1, baseline_packages_per_truck)) * 100).toFixed(1)
  );

  // Space utilization efficiency
  const space_utilization_pct = Math.min(96, Math.max(65, Number((88 + (improvement_pct * 0.25)).toFixed(1))));

  // Transportation freight costs & emissions
  const modeRatePerKgKm: Record<TransportMode, number> = {
    Road: 0.0065,
    Rail: 0.0028,
    Air: 0.0380,
    Sea: 0.0016,
  };
  const freightRate = modeRatePerKgKm[transport_mode] || 0.0065;
  const transportation_cost_total = Math.round(shipment_weight_kg * transport_distance_km * freightRate);

  const freightEmissionsPerKgKm: Record<TransportMode, number> = {
    Road: 0.000105,
    Rail: 0.000032,
    Air: 0.000680,
    Sea: 0.000015,
  };
  const emissionRate = freightEmissionsPerKgKm[transport_mode] || 0.000105;
  const estimated_transport_emissions_kg = Math.round(shipment_weight_kg * transport_distance_km * emissionRate);

  const dimension_efficiency_note = `Right-sized packaging allows ${packages_per_truck.toLocaleString()} units per truck vs. ${baseline_packages_per_truck.toLocaleString()} baseline (+${improvement_pct}% space yield). Eliminates ${Math.max(1, Math.ceil(shipment_volume_m3 / truckUsableVolume_m3 * (improvement_pct / 100)))} full freight truck runs across ${transport_distance_km} km.`;

  return {
    package_volume_l,
    shipment_volume_m3,
    shipment_weight_kg,
    space_utilization_pct,
    transportation_cost_total,
    estimated_transport_emissions_kg,
    packages_per_truck,
    packages_per_container,
    baseline_packages_per_truck,
    improvement_pct,
    dimension_efficiency_note,
  };
}
