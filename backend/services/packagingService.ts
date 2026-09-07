import {
  PackagingDesign,
  Product,
  Material,
  PackagingType,
  PackagingGeometry,
  ProductOrientation,
} from '../../src/types.js';
import { SEEDED_MATERIALS } from '../data/materials.js';
import { calculateCost } from './costService.js';
import { calculateCarbon } from './carbonService.js';
import { calculateProtectionScore, simulateDropTest } from './protectionService.js';

export function getMaterialById(materialId: string): Material {
  return SEEDED_MATERIALS.find(m => m.id === materialId) || SEEDED_MATERIALS[0];
}

export function generatePackagingOptions(product: Product): PackagingDesign[] {
  const corrugatedMat = getMaterialById('mat_corrugated');
  const moldedPulpMat = getMaterialById('mat_molded_pulp');
  const bioplasticMat = getMaterialById('mat_bioplastic');
  const foamMat = getMaterialById('mat_foam');
  const rpetMat = getMaterialById('mat_rpet');
  const paperboardMat = getMaterialById('mat_paperboard');

  // Fragility baseline cushioning requirements
  const fragilityCushionMap = {
    'Low': 8,
    'Medium': 15,
    'High': 24,
    'Very High': 32,
  };
  const baseCushion = fragilityCushionMap[product.fragility] || 15;
  const distance = product.shipping_distance_km || product.transport_distance_km || 500;
  const transportMode = product.transport_mode || 'Road';
  const volume = product.annual_quantity || product.expected_volume || 25000;

  // Helper to build a complete packaging design
  const buildDesign = (config: {
    id: string;
    name: string;
    tag: 'Eco Basic' | 'Balanced' | 'Premium' | 'Maximum Protection' | 'Optimized Custom';
    packaging_type: PackagingType;
    material: Material;
    thickness_mm: number;
    cushioning_mm: number;
    clearance_mm: number;
    geometry: PackagingGeometry;
    orientation: ProductOrientation;
    notes: string;
    is_recommended?: boolean;
  }): PackagingDesign => {
    const {
      id,
      name,
      tag,
      packaging_type,
      material,
      thickness_mm,
      cushioning_mm,
      clearance_mm,
      geometry,
      orientation,
      notes,
      is_recommended = false,
    } = config;

    const length_mm = Math.round(product.length_mm + 2 * (cushioning_mm + thickness_mm + clearance_mm));
    const width_mm = Math.round(product.width_mm + 2 * (cushioning_mm + thickness_mm + clearance_mm));
    const height_mm = Math.round(product.height_mm + 2 * (cushioning_mm + thickness_mm + clearance_mm));

    // Calculate shell weight
    const surfaceArea_cm2 = 2 * ((length_mm * width_mm) + (width_mm * height_mm) + (length_mm * height_mm)) / 100;
    const shellWeight_g = Math.round(surfaceArea_cm2 * (thickness_mm / 10) * material.density_g_cm3);
    const cushionWeight_g = Math.round((cushioning_mm * 2.8) * 4);
    const totalWeight_g = shellWeight_g + cushionWeight_g;

    const costBreakdown = calculateCost({
      material,
      length_mm: product.length_mm,
      width_mm: product.width_mm,
      height_mm: product.height_mm,
      thickness_mm,
      cushioning_mm,
      packageWeight_g: totalWeight_g,
      transport_distance_km: distance,
      transport_mode: transportMode,
      annual_quantity: volume,
    });

    const carbonBreakdown = calculateCarbon({
      material,
      packageWeight_g: totalWeight_g,
      transport_distance_km: distance,
      transport_mode: transportMode,
      recyclability_pct: material.recyclability_pct,
      total_packages: volume,
    });

    const protectionBreakdown = calculateProtectionScore({
      material,
      product_weight_g: product.weight_g,
      product_fragility: product.fragility,
      thickness_mm,
      cushioning_mm,
      internal_clearance_mm: clearance_mm,
      geometry,
    });

    // Sub-scores normalized to 0-100
    const sustainability_score = Math.round(
      (material.recyclability_pct * 0.4) +
      (material.recycled_content_pct * 0.3) +
      (material.end_of_life_score * 0.3)
    );

    // Logistics cube utilization score
    const volume_l = (length_mm * width_mm * height_mm) / 1000000;
    const logistics_score = Math.min(98, Math.max(50, Math.round(100 - (volume_l * 3.8) - (totalWeight_g * 0.04))));

    // Material efficiency: ratio of product payload to total package weight and void volume
    const innerVol = (product.length_mm * product.width_mm * product.height_mm) / 1000000;
    const payloadEfficiencyRatio = innerVol / Math.max(0.0001, volume_l);
    const material_efficiency_score = Math.min(99, Math.max(45, Math.round(payloadEfficiencyRatio * 115)));

    const brand_score = material.aesthetic_score;

    // Overall multi-objective weighted score based on product priorities
    const wProt = (product.priority_protection || 30) / 100;
    const wCost = (product.priority_cost || 20) / 100;
    const wSust = (product.priority_sustainability || 20) / 100;
    const wLog = (product.priority_logistics || 15) / 100;
    const wMat = (product.priority_material_efficiency || 15) / 100;

    // Cost efficiency score (higher is better, normalized relative to target budget)
    const targetBudget = product.target_cost || product.budget || 20;
    const costEfficiency = Math.min(100, Math.max(20, Math.round((targetBudget / Math.max(5, costBreakdown.totalCost)) * 75)));

    const overall_score = Math.round(
      protectionBreakdown.overallScore * wProt +
      costEfficiency * wCost +
      sustainability_score * wSust +
      logistics_score * wLog +
      material_efficiency_score * wMat
    );

    return {
      id,
      project_id: product.project_id,
      name,
      tag,
      packaging_type,
      material_id: material.id,
      material_name: material.name,
      length_mm,
      width_mm,
      height_mm,
      thickness_mm,
      cushioning_mm,
      internal_clearance_mm: clearance_mm,
      geometry,
      orientation,
      weight_g: totalWeight_g,
      estimated_cost: costBreakdown.totalCost,
      cost_breakdown: costBreakdown,
      carbon_footprint: carbonBreakdown.totalCarbonFootprint,
      carbon_breakdown: carbonBreakdown,
      recyclability: material.recyclability_pct,
      protection_score: protectionBreakdown.overallScore,
      protection_breakdown: protectionBreakdown,
      sustainability_score,
      logistics_score,
      material_efficiency_score,
      brand_score,
      overall_score,
      is_recommended,
      notes,
    };
  };

  // 1. Eco Basic (Corrugated Box + Kraft minimal wrap)
  const opt1 = buildDesign({
    id: `pkg_basic_${Date.now()}`,
    name: 'Option 1: Eco Basic',
    tag: 'Eco Basic',
    packaging_type: 'Corrugated Box',
    material: corrugatedMat,
    thickness_mm: 3.0,
    cushioning_mm: Math.max(8, baseCushion - 6),
    clearance_mm: 2.0,
    geometry: 'Standard Rectangular',
    orientation: 'Upright Vertical',
    notes: 'Cost-minimized recyclable fluted board with curbside paper collection readiness.',
  });

  // 2. Balanced (Thermoformed Molded Pulp Cradle + Outer Sleeve)
  const opt2 = buildDesign({
    id: `pkg_balanced_${Date.now()}`,
    name: 'Option 2: Balanced Trade-Off',
    tag: 'Balanced',
    packaging_type: 'Molded Pulp',
    material: moldedPulpMat,
    thickness_mm: 2.8,
    cushioning_mm: baseCushion,
    clearance_mm: 1.5,
    geometry: 'Form-Fitting Sleeve',
    orientation: 'Upright Vertical',
    notes: 'Plastic-free sugarcane bagasse chassis providing optimal shock-to-weight balance.',
    is_recommended: true,
  });

  // 3. Premium (Compostable Bio-based Composite with Luxury Matte Shell)
  const opt3 = buildDesign({
    id: `pkg_premium_${Date.now()}`,
    name: 'Option 3: Premium Eco-Luxe',
    tag: 'Premium',
    packaging_type: 'Bio-based',
    material: bioplasticMat,
    thickness_mm: 2.2,
    cushioning_mm: baseCushion + 2,
    clearance_mm: 1.0,
    geometry: 'Clamshell Cushion',
    orientation: 'Upright Vertical',
    notes: 'Silky tactile bio-polymer clamshell delivering high-end unboxing and marine degradability.',
  });

  // 4. Maximum Protection (Mycelium Bio-Foam Deep Armor)
  const opt4 = buildDesign({
    id: `pkg_maxprot_${Date.now()}`,
    name: 'Option 4: Maximum Protection Armor',
    tag: 'Maximum Protection',
    packaging_type: 'Hybrid',
    material: foamMat,
    thickness_mm: 3.5,
    cushioning_mm: baseCushion + 8,
    clearance_mm: 2.5,
    geometry: 'Dual-Chamber',
    orientation: 'Upright Vertical',
    notes: 'Engineered multi-stage shock attenuation buffer eliminating catastrophic drop damage on extreme transit routes.',
  });

  return [opt1, opt2, opt3, opt4];
}

export function recalculatePackagingMetrics(config: {
  material_id: string;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  thickness_mm: number;
  cushioning_mm: number;
  internal_clearance_mm?: number;
  geometry?: PackagingGeometry;
  orientation?: ProductOrientation;
  transport_distance_km?: number;
  transport_mode?: 'Road' | 'Rail' | 'Air' | 'Sea';
  product_weight_g?: number;
  product_fragility?: 'Low' | 'Medium' | 'High' | 'Very High';
  annual_quantity?: number;
}) {
  const material = getMaterialById(config.material_id);
  const distance = config.transport_distance_km || 500;
  const mode = config.transport_mode || 'Road';
  const prodWeight = config.product_weight_g || 450;
  const fragility = config.product_fragility || 'Medium';
  const volume = config.annual_quantity || 25000;
  const clearance = config.internal_clearance_mm || 2.0;
  const geometry = config.geometry || 'Standard Rectangular';
  const orientation = config.orientation || 'Upright Vertical';

  // Outer packaging dimensions
  const outerL = Math.round(config.length_mm + 2 * (config.cushioning_mm + config.thickness_mm + clearance));
  const outerW = Math.round(config.width_mm + 2 * (config.cushioning_mm + config.thickness_mm + clearance));
  const outerH = Math.round(config.height_mm + 2 * (config.cushioning_mm + config.thickness_mm + clearance));

  const surfaceArea_cm2 = 2 * ((outerL * outerW) + (outerW * outerH) + (outerL * outerH)) / 100;
  const shellWeight_g = Math.round(surfaceArea_cm2 * (config.thickness_mm / 10) * material.density_g_cm3);
  const cushionWeight_g = Math.round((config.cushioning_mm * 2.8) * 4);
  const totalPackageWeight_g = shellWeight_g + cushionWeight_g;

  const costBreakdown = calculateCost({
    material,
    length_mm: config.length_mm,
    width_mm: config.width_mm,
    height_mm: config.height_mm,
    thickness_mm: config.thickness_mm,
    cushioning_mm: config.cushioning_mm,
    packageWeight_g: totalPackageWeight_g,
    transport_distance_km: distance,
    transport_mode: mode,
    annual_quantity: volume,
  });

  const carbonBreakdown = calculateCarbon({
    material,
    packageWeight_g: totalPackageWeight_g,
    transport_distance_km: distance,
    transport_mode: mode,
    recyclability_pct: material.recyclability_pct,
    total_packages: volume,
  });

  const protectionBreakdown = calculateProtectionScore({
    material,
    product_weight_g: prodWeight,
    product_fragility: fragility,
    thickness_mm: config.thickness_mm,
    cushioning_mm: config.cushioning_mm,
    internal_clearance_mm: clearance,
    geometry,
  });

  const dropTest = simulateDropTest({
    material,
    product_weight_g: prodWeight,
    product_fragility: fragility,
    drop_height_m: 1.2,
    surface: 'Concrete',
    orientation: 'Corner',
    cushioning_mm: config.cushioning_mm,
    thickness_mm: config.thickness_mm,
  });

  const packVolume_l = Number(((outerL * outerW * outerH) / 1000000).toFixed(2));
  const logistics_score = Math.min(98, Math.max(50, Math.round(100 - (packVolume_l * 3.8) - (totalPackageWeight_g * 0.04))));

  const sustainability_score = Math.round(
    (material.recyclability_pct * 0.4) +
    (material.recycled_content_pct * 0.3) +
    (material.end_of_life_score * 0.3)
  );

  const innerVol = (config.length_mm * config.width_mm * config.height_mm) / 1000000;
  const payloadRatio = innerVol / Math.max(0.0001, packVolume_l);
  const material_efficiency_score = Math.min(99, Math.max(45, Math.round(payloadRatio * 115)));

  const brand_score = material.aesthetic_score;

  const overall_score = Math.round(
    protectionBreakdown.overallScore * 0.30 +
    (Math.min(100, (20 / Math.max(5, costBreakdown.totalCost)) * 75)) * 0.20 +
    sustainability_score * 0.20 +
    logistics_score * 0.15 +
    material_efficiency_score * 0.15
  );

  return {
    material_id: material.id,
    material_name: material.name,
    outer_dimensions: { length_mm: outerL, width_mm: outerW, height_mm: outerH },
    package_volume_l: packVolume_l,
    weight_g: totalPackageWeight_g,
    shell_weight_g: shellWeight_g,
    cushion_weight_g: cushionWeight_g,
    estimated_cost: costBreakdown.totalCost,
    cost_breakdown: costBreakdown,
    carbon_footprint: carbonBreakdown.totalCarbonFootprint,
    carbon_breakdown: carbonBreakdown,
    protection_score: protectionBreakdown.overallScore,
    protection_breakdown: protectionBreakdown,
    recyclability: material.recyclability_pct,
    drop_test_result: dropTest,
    sustainability_score,
    logistics_score,
    material_efficiency_score,
    brand_score,
    overall_score,
    geometry,
    orientation,
  };
}
