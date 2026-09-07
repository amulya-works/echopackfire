// Global TypeScript definitions for EchoPack
// "Design smarter. Protect better. Waste less."

export type ProductFragility = 'Low' | 'Medium' | 'High' | 'Very High';
export type SurfaceSensitivity = 'Low' | 'Scratch-prone' | 'Abrasion-sensitive' | 'High Polish';
export type ProductShape = 'Rectangular' | 'Cylindrical' | 'Irregular' | 'Spherical';
export type TransportMode = 'Road' | 'Rail' | 'Air' | 'Sea';
export type BrandStyle = 'Premium' | 'Minimal' | 'Eco-conscious' | 'Standard';
export type PackagingPurpose = 'E-commerce Shipping' | 'Retail Shelf' | 'Industrial Transit' | 'Gift / Luxury';
export type PackagingType = 'Corrugated Box' | 'Folding Carton' | 'Molded Pulp' | 'Paperboard' | 'Recycled Plastic' | 'Bio-based' | 'Hybrid';
export type PackagingGeometry = 'Standard Rectangular' | 'Form-Fitting Sleeve' | 'Clamshell Cushion' | 'Hexagonal Pillar' | 'Dual-Chamber';
export type ProductOrientation = 'Upright Vertical' | 'Horizontal Flat' | 'Side Incline';
export type DropSurface = 'Concrete' | 'Wood' | 'Carpet';
export type DropOrientation = 'Corner' | 'Edge' | 'Flat Face';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Material {
  id: string;
  name: string;
  category: 'Paper & Board' | 'Fiber & Pulp' | 'Polymer' | 'Bio-based' | 'Composite' | 'Metal & Glass';
  density_g_cm3: number;
  cost_per_kg: number; // in ₹ or base currency
  carbon_factor_kg_co2e_per_kg: number;
  strength_mpa: number; // Structural yield / tensile strength
  recyclability_pct: number;
  recycled_content_pct: number;
  moisture_resistance: 'Low' | 'Medium' | 'High' | 'Waterproof';
  fragility_suitability: 'Low' | 'Medium' | 'High' | 'Very High';
  end_of_life_score: number; // 0-100
  shock_absorption_coef: number; // 0.1 - 1.0
  stiffness_modulus_mpa: number;
  aesthetic_score: number; // 0-100
  description: string;
  color_hex: string;
  texture_type: 'corrugated' | 'smooth_pulp' | 'kraft' | 'polymer' | 'matte' | 'metallic' | 'glass';
}

export interface Product {
  id: string;
  project_id: string;
  name: string;
  category: string;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  weight_g: number;
  shape?: ProductShape;
  fragility: ProductFragility;
  surface_sensitivity?: SurfaceSensitivity;
  packaging_purpose?: PackagingPurpose;
  target_cost?: number; // target cost/package (e.g. ₹20)
  annual_quantity?: number;
  max_dimensions_l_mm?: number;
  max_dimensions_w_mm?: number;
  max_dimensions_h_mm?: number;
  max_weight_g?: number;
  sustainability_target?: string;
  brand_style?: BrandStyle;
  shipping_distance_km?: number;
  transport_mode?: TransportMode;
  number_of_packages?: number;
  // Dynamic Priority Sliders (Weights for Optimizer)
  priority_protection?: number; // 0-100
  priority_cost?: number;
  priority_sustainability?: number;
  priority_branding?: number;
  priority_logistics?: number;
  priority_material_efficiency?: number;
  budget?: number; // alias for target_cost
  expected_volume?: number; // alias for annual_quantity
  transport_distance_km?: number; // alias
}

export interface CostBreakdown {
  materialCost: number;
  manufacturingCost: number;
  printingCost: number;
  assemblyCost: number;
  cushioningCost: number;
  transportCost: number;
  totalCost: number;
  annualCost: number;
  savingsPerPackage: number;
  annualSavings: number;
  savingsPct: number;
  calculationExplanation: string;
}

export interface CarbonBreakdown {
  materialCarbon: number;
  manufacturingCarbon: number;
  transportCarbon: number;
  endOfLifeCarbon: number;
  totalCarbonFootprint: number; // kg CO2e / package
  totalShipmentCarbon: number; // kg CO2e for shipment volume
  baselineCarbon: number;
  reductionPct: number;
  isEstimate: boolean;
  disclaimer: string;
}

export interface ProtectionBreakdown {
  overallScore: number; // 0-100
  impactProtection: number;
  compressionStrength: number;
  cushioningEffectiveness: number;
  structuralStability: number;
  productFit: number;
  whyExplanation: string;
}

export interface DropTestResult {
  id: string;
  packaging_id: string;
  drop_height_m: number;
  surface: DropSurface;
  orientation: DropOrientation;
  product_fragility: ProductFragility;
  protection_score: number;
  estimated_deformation_pct: number;
  product_risk: 'Low' | 'Moderate' | 'High' | 'Critical';
  structural_status: 'PASS' | 'BORDERLINE' | 'FAIL';
  impact_velocity_ms: number;
  peak_deceleration_g: number;
  energy_absorbed_j: number;
  impact_severity: 'Low' | 'Moderate' | 'Severe' | 'Critical';
  disclaimer: string;
}

export interface CompressionTestResult {
  stack_height_boxes: number;
  duration_days: number;
  material_strength_mpa: number;
  bct_newtons: number; // Box Compression Test yield
  stack_load_kg: number;
  safety_factor: number;
  deflection_mm: number;
  status: 'PASS' | 'BORDERLINE' | 'FAIL';
  explanation: string;
}

export interface VibrationTestResult {
  transport_mode: TransportMode;
  distance_km: number;
  duration_hours: number;
  resonant_frequency_hz: number;
  fatigue_index_pct: number;
  settling_score: number;
  abrasion_risk: 'Low' | 'Medium' | 'High';
  status: 'PASS' | 'BORDERLINE' | 'FAIL';
  explanation: string;
}

export interface LogisticsMetrics {
  package_volume_l: number;
  shipment_volume_m3: number;
  shipment_weight_kg: number;
  space_utilization_pct: number;
  transportation_cost_total: number;
  estimated_transport_emissions_kg: number;
  packages_per_truck: number;
  packages_per_container: number;
  baseline_packages_per_truck: number;
  improvement_pct: number;
  dimension_efficiency_note: string;
}

export interface PackagingDesign {
  id: string;
  project_id: string;
  name: string;
  packaging_type: PackagingType;
  material_id: string;
  material_name: string;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  thickness_mm: number;
  cushioning_mm: number;
  internal_clearance_mm: number;
  geometry: PackagingGeometry;
  orientation: ProductOrientation;
  weight_g: number;
  estimated_cost: number;
  cost_breakdown?: CostBreakdown;
  carbon_footprint: number; // kg CO2e
  carbon_breakdown?: CarbonBreakdown;
  recyclability: number; // 0-100
  protection_score: number; // 0-100
  protection_breakdown?: ProtectionBreakdown;
  sustainability_score: number; // 0-100
  logistics_score: number; // 0-100
  material_efficiency_score: number; // 0-100
  brand_score: number; // 0-100
  overall_score: number; // 0-100
  is_recommended?: boolean;
  notes?: string;
  tag?: 'Eco Basic' | 'Balanced' | 'Premium' | 'Maximum Protection' | 'Optimized Custom';
}

export interface ScenarioWeights {
  sustainability: number; // 0-100
  protection: number;
  cost: number;
  logistics: number;
  brand: number;
  material_efficiency?: number;
}

export interface ScenarioConstraints {
  transport_distance_km: number;
  budget: number;
  carbon_target: number; // kg CO2e
  min_protection: number; // 0-100
  min_recyclability?: number;
  transport_mode?: TransportMode;
}

export interface ScenarioSimulationResult {
  scenarioName?: string;
  weights: ScenarioWeights;
  constraints: ScenarioConstraints;
  rankedDesigns: Array<{
    design: PackagingDesign;
    finalScore: number;
    componentScores: {
      sustainabilityScore: number;
      protectionScore: number;
      costScore: number;
      logisticsScore: number;
      brandScore: number;
      materialEfficiencyScore?: number;
    };
    isFeasible: boolean;
    rejectionReason?: string;
  }>;
  bestOption: PackagingDesign;
  previousBestOption?: PackagingDesign;
  shiftExplanation?: string;
}

export interface ParetoPoint {
  id: string;
  name: string;
  material: string;
  cost: number;
  carbon: number;
  protection: number;
  score: number;
  sustainability: number;
  isParetoOptimal: boolean;
  isRecommended?: boolean;
}

export interface OptimizationWeights {
  cost: number;
  carbon: number;
  protection: number;
  material_efficiency: number;
  volume_efficiency: number;
  recyclability: number;
}

export interface OptimizationResult {
  bestSolution: PackagingDesign;
  decisionScore: number;
  topAlternatives: PackagingDesign[];
  rejectedSolutions: Array<{
    design: PackagingDesign;
    reasons: string[];
  }>;
  paretoFrontier: ParetoPoint[];
  summaryExplanation: string;
  recommendedDesign?: PackagingDesign;
  rankedOptions?: any[];
  tradeoffExplanation?: string;
  recommendationDetails?: {
    whyThisDesign: string;
    whatChanged: string;
    expectedBenefits: string[];
    tradeOffs: string[];
    potentialRisks: string[];
  };
}

export interface ComplianceRule {
  id: string;
  category: 'Material Restrictions' | 'Labelling & Markings' | 'Recyclability Standards' | 'Food-Contact Considerations' | 'Packaging Waste (EPR)' | 'Transport Safety';
  region: 'European Union (PPWR)' | 'United States (FTC / EPR)' | 'India (PWM / EPR)' | 'Global / ISO 14021';
  rule: string;
  standard: string;
  status: 'Compliant' | 'Caution' | 'Action Required';
  details: string;
  remedy: string;
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  materials_supplied: string[];
  min_order_qty: number;
  price_tier: 'Budget' | 'Moderate' | 'Premium';
  certifications: string[];
  recycled_content_avg_pct: number;
  manufacturing_capabilities: string[];
  lead_time_days: number;
  contact_email: string;
  rating: number;
  is_verified_demo: boolean;
}

export interface GlobalBenchmark {
  metric: string;
  yourDesign: number;
  industryBenchmark: number;
  bestPerformingDemo: number;
  unit: string;
  deltaPct: number;
  status: 'Leading' | 'On Par' | 'Opportunity';
  dataSource: 'DEMO BENCHMARK DATA' | 'VERIFIED LCA DATA';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: 'Draft' | 'Simulated' | 'Optimized';
  product: Product;
  designs: PackagingDesign[];
  selected_design_id?: string;
  latest_scenario?: {
    weights: ScenarioWeights;
    constraints: ScenarioConstraints;
  };
  metrics?: {
    carbon_reduction_pct: number;
    cost_optimization_pct: number;
    protection_score: number;
    cost_savings_annual?: number;
    co2_avoided_annual_kg?: number;
    material_saved_pct?: number;
    sustainability_score?: number;
  };
}

export interface AIAdvisorMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  structuredRequirements?: Partial<Product>;
  referencedDesignId?: string;
  suggestedActions?: string[];
}
