import {
  DropSurface,
  DropOrientation,
  ProductFragility,
  DropTestResult,
  CompressionTestResult,
  VibrationTestResult,
  ProtectionBreakdown,
  Material,
  TransportMode,
  PackagingGeometry,
} from '../../src/types.js';

export interface ProtectionScoreParams {
  material: Material;
  product_weight_g: number;
  product_fragility: ProductFragility;
  thickness_mm: number;
  cushioning_mm: number;
  internal_clearance_mm?: number;
  geometry?: PackagingGeometry;
}

export function calculateProtectionScore(params: ProtectionScoreParams): ProtectionBreakdown {
  const {
    material,
    product_weight_g,
    product_fragility,
    thickness_mm,
    cushioning_mm,
    internal_clearance_mm = 2.0,
    geometry = 'Standard Rectangular',
  } = params;

  // Fragility index
  const fragilityWeightFactor = {
    'Low': 1.15,
    'Medium': 1.0,
    'High': 0.82,
    'Very High': 0.68,
  }[product_fragility];

  // 1. Impact Protection (0-100)
  // Driven by shock absorption coefficient and cushioning depth relative to weight
  const effectiveCushionRatio = cushioning_mm / Math.max(10, Math.sqrt(product_weight_g));
  const rawImpact = 55 + (effectiveCushionRatio * 28 * material.shock_absorption_coef);
  const impactProtection = Math.min(99, Math.max(25, Math.round(rawImpact * fragilityWeightFactor)));

  // 2. Compression Strength (0-100)
  // Driven by material strength (MPa), stiffness modulus and wall thickness
  const rawCompression = 40 + ((material.strength_mpa / 50) * 22) + ((thickness_mm / 3.0) * 20);
  const compressionStrength = Math.min(98, Math.max(20, Math.round(rawCompression)));

  // 3. Cushioning Effectiveness (0-100)
  const rawCushioning = 45 + (cushioning_mm * 1.6) * material.shock_absorption_coef;
  const cushioningEffectiveness = Math.min(98, Math.max(30, Math.round(rawCushioning)));

  // 4. Structural Stability (0-100)
  let geomMultiplier = 1.0;
  if (geometry === 'Form-Fitting Sleeve') geomMultiplier = 1.08;
  if (geometry === 'Clamshell Cushion') geomMultiplier = 1.12;
  if (geometry === 'Hexagonal Pillar') geomMultiplier = 1.15;
  if (geometry === 'Dual-Chamber') geomMultiplier = 1.18;
  const rawStability = ((material.stiffness_modulus_mpa / 1000) * 45) + ((thickness_mm / 3.0) * 35);
  const structuralStability = Math.min(99, Math.max(25, Math.round(rawStability * geomMultiplier)));

  // 5. Product Fit (0-100)
  // Snugger clearance (1-3mm) yields better fit; >8mm creates rattling hazard
  let fitScore = 96;
  if (internal_clearance_mm > 5) {
    fitScore -= (internal_clearance_mm - 5) * 6;
  } else if (internal_clearance_mm < 1) {
    fitScore -= 8; // too tight could cause abrasion
  }
  const productFit = Math.min(98, Math.max(40, Math.round(fitScore)));

  // Overall Score
  const overallScore = Math.round(
    impactProtection * 0.30 +
    compressionStrength * 0.25 +
    cushioningEffectiveness * 0.20 +
    structuralStability * 0.15 +
    productFit * 0.10
  );

  const whyExplanation = `Protection Score of ${overallScore}/100 derived from ${material.name} shock damping (${material.shock_absorption_coef * 100}% absorption), ${thickness_mm}mm wall thickness yielding ${compressionStrength}/100 compression, and ${cushioning_mm}mm perimeter buffer tuned for a ${product_fragility} fragility profile weighing ${product_weight_g}g.`;

  return {
    overallScore,
    impactProtection,
    compressionStrength,
    cushioningEffectiveness,
    structuralStability,
    productFit,
    whyExplanation,
  };
}

export interface DropTestParams {
  material: Material;
  product_weight_g: number;
  product_fragility: ProductFragility;
  drop_height_m: number;
  surface: DropSurface;
  orientation: DropOrientation;
  cushioning_mm: number;
  thickness_mm: number;
}

export function simulateDropTest(params: DropTestParams): DropTestResult {
  const {
    material,
    product_weight_g,
    product_fragility,
    drop_height_m,
    surface,
    orientation,
    cushioning_mm,
    thickness_mm,
  } = params;

  const g = 9.81;
  const impact_velocity_ms = Number(Math.sqrt(2 * g * drop_height_m).toFixed(2));
  const mass_kg = product_weight_g / 1000;
  const energy_absorbed_j = Number((mass_kg * g * drop_height_m).toFixed(2));

  const surfaceRigidity: Record<DropSurface, number> = {
    Concrete: 1.0,
    Wood: 0.76,
    Carpet: 0.48,
  };
  const surfaceFactor = surfaceRigidity[surface] || 1.0;

  const orientationFactor: Record<DropOrientation, number> = {
    'Corner': 1.45,
    'Edge': 1.20,
    'Flat Face': 0.85,
  };
  const orientMultiplier = orientationFactor[orientation] || 1.2;

  const maxDeflection_mm = Math.max(3, (cushioning_mm * 0.7) + (thickness_mm * 0.5));
  const deflection_m = maxDeflection_mm / 1000;
  const cushionEfficiency = 0.65 * material.shock_absorption_coef;

  const baseG = (Math.pow(impact_velocity_ms, 2)) / (2 * deflection_m * Math.max(0.25, cushionEfficiency));
  const peak_deceleration_g = Number((baseG * surfaceFactor * orientMultiplier * 0.18).toFixed(1));

  const fragilityLimits: Record<ProductFragility, number> = {
    'Low': 85,
    'Medium': 52,
    'High': 32,
    'Very High': 22,
  };
  const gThreshold = fragilityLimits[product_fragility] || 50;

  const structuralResistance = (material.stiffness_modulus_mpa / 1000) * (thickness_mm / 3.0);
  const rawDeformation = (energy_absorbed_j / (structuralResistance * 8.5)) * orientMultiplier * surfaceFactor * 10;
  const estimated_deformation_pct = Math.min(65, Math.max(3, Number(rawDeformation.toFixed(1))));

  const gRatio = peak_deceleration_g / gThreshold;
  let protectionScoreRaw: number;

  if (gRatio <= 0.6) {
    protectionScoreRaw = 95 - (gRatio * 15);
  } else if (gRatio <= 1.0) {
    protectionScoreRaw = 86 - ((gRatio - 0.6) * 35);
  } else if (gRatio <= 1.4) {
    protectionScoreRaw = 72 - ((gRatio - 1.0) * 45);
  } else {
    protectionScoreRaw = Math.max(18, 54 - ((gRatio - 1.4) * 30));
  }

  if (estimated_deformation_pct > 25) {
    protectionScoreRaw -= (estimated_deformation_pct - 25) * 0.6;
  }

  const protection_score = Math.min(99, Math.max(15, Math.round(protectionScoreRaw)));

  let product_risk: 'Low' | 'Moderate' | 'High' | 'Critical';
  let structural_status: 'PASS' | 'BORDERLINE' | 'FAIL';
  let impact_severity: 'Low' | 'Moderate' | 'Severe' | 'Critical';

  if (peak_deceleration_g < 25) impact_severity = 'Low';
  else if (peak_deceleration_g < 45) impact_severity = 'Moderate';
  else if (peak_deceleration_g < 70) impact_severity = 'Severe';
  else impact_severity = 'Critical';

  if (gRatio < 0.85 && estimated_deformation_pct < 18) {
    product_risk = 'Low';
    structural_status = 'PASS';
  } else if (gRatio <= 1.15 && estimated_deformation_pct < 30) {
    product_risk = 'Moderate';
    structural_status = 'PASS';
  } else if (gRatio <= 1.45 || estimated_deformation_pct < 45) {
    product_risk = 'High';
    structural_status = 'BORDERLINE';
  } else {
    product_risk = 'Critical';
    structural_status = 'FAIL';
  }

  return {
    id: `dt_${Date.now()}`,
    packaging_id: 'active_pkg',
    drop_height_m,
    surface,
    orientation,
    product_fragility,
    protection_score,
    estimated_deformation_pct,
    product_risk,
    structural_status,
    impact_velocity_ms,
    peak_deceleration_g,
    energy_absorbed_j,
    impact_severity,
    disclaimer: 'Virtual simulation is an engineering estimate and does not replace physical testing or certification.',
  };
}

export interface CompressionTestParams {
  stack_height_boxes: number;
  duration_days: number;
  material_strength_mpa: number;
  package_weight_kg: number;
  perimeter_mm: number;
  thickness_mm: number;
}

export function simulateCompressionTest(params: CompressionTestParams): CompressionTestResult {
  const {
    stack_height_boxes = 6,
    duration_days = 30,
    material_strength_mpa = 42,
    package_weight_kg = 0.65,
    perimeter_mm = 600,
    thickness_mm = 3.2,
  } = params;

  // McKee Formula approximation for Box Compression Test (BCT) yield in Newtons
  // BCT = 5.87 * ECT * sqrt(thickness * perimeter)
  const ect_approx = (material_strength_mpa * 0.12);
  const bct_newtons = Math.round(5.87 * ect_approx * Math.sqrt(thickness_mm * (perimeter_mm / 10)));

  // Total dead weight stacked atop the bottom box
  const stackedBoxes = Math.max(1, stack_height_boxes - 1);
  const stack_load_kg = Number((stackedBoxes * package_weight_kg).toFixed(2));
  const stack_load_newtons = stack_load_kg * 9.81;

  // Environmental degradation factor over time (creep + humidity)
  const creepFactor = Math.max(0.55, 1.0 - (duration_days * 0.008));
  const effectiveCapacity_newtons = bct_newtons * creepFactor;

  const safety_factor = Number((effectiveCapacity_newtons / Math.max(1, stack_load_newtons)).toFixed(2));
  const deflection_mm = Number(((stack_load_newtons / (effectiveCapacity_newtons * 2.5)) * thickness_mm * 1.8).toFixed(1));

  let status: 'PASS' | 'BORDERLINE' | 'FAIL';
  if (safety_factor >= 3.0) status = 'PASS';
  else if (safety_factor >= 1.8) status = 'PASS';
  else if (safety_factor >= 1.2) status = 'BORDERLINE';
  else status = 'FAIL';

  const explanation = `At a stack height of ${stack_height_boxes} units (${stack_load_kg} kg deadweight load for ${duration_days} days), the box exhibits a static safety factor of ${safety_factor}x with ${deflection_mm}mm estimated creep deflection against a nominal BCT of ${bct_newtons} N.`;

  return {
    stack_height_boxes,
    duration_days,
    material_strength_mpa,
    bct_newtons,
    stack_load_kg,
    safety_factor,
    deflection_mm,
    status,
    explanation,
  };
}

export interface VibrationTestParams {
  transport_mode: TransportMode;
  distance_km: number;
  duration_hours?: number;
  cushioning_mm?: number;
}

export function simulateVibrationTest(params: VibrationTestParams): VibrationTestResult {
  const {
    transport_mode = 'Road',
    distance_km = 500,
    duration_hours = Math.round(distance_km / 65),
    cushioning_mm = 18,
  } = params;

  // ASTM D4728 PSD vibration spectrum profiles
  const modeResonance: Record<TransportMode, number> = {
    Road: 12.5, // 10-15 Hz truck axle/chassis bounce
    Rail: 8.2,  // 7-9 Hz track harmonic sway
    Air: 34.0,  // 25-50 Hz jet turbine vibration
    Sea: 4.5,   // 2-5 Hz wave hull heave
  };

  const resonant_frequency_hz = modeResonance[transport_mode] || 12.5;
  const hours = duration_hours || Math.max(2, Math.round(distance_km / 65));

  // Fatigue accumulation index
  const rawFatigue = (hours * 1.4) + (transport_mode === 'Road' ? 18 : transport_mode === 'Air' ? 24 : 12);
  const fatigue_index_pct = Math.min(85, Math.max(10, Math.round(rawFatigue)));

  // Settling score (compaction of cushioning over distance)
  const settling_score = Math.min(99, Math.max(40, Math.round(98 - (hours * 0.45) + (cushioning_mm * 0.5))));

  let abrasion_risk: 'Low' | 'Medium' | 'High';
  if (fatigue_index_pct < 35) abrasion_risk = 'Low';
  else if (fatigue_index_pct < 65) abrasion_risk = 'Medium';
  else abrasion_risk = 'High';

  let status: 'PASS' | 'BORDERLINE' | 'FAIL';
  if (fatigue_index_pct <= 50) status = 'PASS';
  else if (fatigue_index_pct <= 72) status = 'BORDERLINE';
  else status = 'FAIL';

  const explanation = `Simulated ${hours} hrs of ${transport_mode} transit across ${distance_km} km with peak resonance excitation at ${resonant_frequency_hz} Hz. Cushion settling score is ${settling_score}/100 with ${abrasion_risk.toLowerCase()} micro-abrasion risk.`;

  return {
    transport_mode,
    distance_km,
    duration_hours: hours,
    resonant_frequency_hz,
    fatigue_index_pct,
    settling_score,
    abrasion_risk,
    status,
    explanation,
  };
}
