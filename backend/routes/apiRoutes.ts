import { Router, Request, Response } from 'express';
import { db } from '../database/db.js';
import { Project, Product, ScenarioWeights, ScenarioConstraints } from '../../src/types.js';
import { generatePackagingOptions, recalculatePackagingMetrics } from '../services/packagingService.js';
import { calculateCost } from '../services/costService.js';
import { calculateCarbon } from '../services/carbonService.js';
import {
  simulateDropTest,
  simulateCompressionTest,
  simulateVibrationTest,
  calculateProtectionScore,
} from '../services/protectionService.js';
import { calculateLogistics } from '../services/logisticsService.js';
import { simulateScenario, PRESET_SCENARIOS } from '../services/scenarioService.js';
import { runOptimization, OptimizationMode } from '../services/optimizationService.js';
import { askAdvisor } from '../services/aiService.js';
import { COMPLIANCE_DATABASE } from '../data/compliance.js';
import { DEMO_SUPPLIERS } from '../data/suppliers.js';
import { getGlobalBenchmarks } from '../data/benchmarks.js';

export const apiRouter = Router();

// ==================== AUTH ====================
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = {
    id: 'usr_demo_1',
    email: email || 'demo@echopack.io',
    name: 'Alex Morgan',
    role: 'Lead Packaging Decision Architect',
  };
  const token = `jwt_mock_${Buffer.from(JSON.stringify({ id: user.id, email: user.email, exp: Date.now() + 86400000 })).toString('base64')}`;
  res.json({
    success: true,
    user,
    token,
    message: 'EchoPack authentication session active',
  });
});

// ==================== PROJECTS ====================
apiRouter.get('/projects', (req: Request, res: Response) => {
  const projects = db.getAllProjects();
  res.json(projects);
});

apiRouter.post('/projects', (req: Request, res: Response) => {
  const { name, description, product } = req.body;
  if (!name || !product) {
    return res.status(400).json({ error: 'Project name and product specifications are required' });
  }

  const projectId = `proj_${Date.now()}`;
  const productId = `prod_${Date.now()}`;

  const newProduct: Product = {
    ...product,
    id: productId,
    project_id: projectId,
    length_mm: Number(product.length_mm) || 100,
    width_mm: Number(product.width_mm) || 100,
    height_mm: Number(product.height_mm) || 100,
    weight_g: Number(product.weight_g) || 300,
    budget: Number(product.budget || product.target_cost) || 20,
    target_cost: Number(product.target_cost || product.budget) || 20,
    expected_volume: Number(product.expected_volume || product.annual_quantity) || 25000,
    annual_quantity: Number(product.annual_quantity || product.expected_volume) || 25000,
    transport_distance_km: Number(product.transport_distance_km || product.shipping_distance_km) || 500,
    shipping_distance_km: Number(product.shipping_distance_km || product.transport_distance_km) || 500,
    fragility: product.fragility || 'Medium',
    brand_style: product.brand_style || 'Eco-conscious',
    transport_mode: product.transport_mode || 'Road',
    priority_protection: Number(product.priority_protection) || 30,
    priority_cost: Number(product.priority_cost) || 20,
    priority_sustainability: Number(product.priority_sustainability) || 20,
    priority_logistics: Number(product.priority_logistics) || 15,
    priority_material_efficiency: Number(product.priority_material_efficiency) || 15,
  };

  const designs = generatePackagingOptions(newProduct);

  const newProject: Project = {
    id: projectId,
    name,
    description: description || `EchoPack packaging project for ${newProduct.name}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'Optimized',
    product: newProduct,
    designs,
    selected_design_id: designs.find(d => d.is_recommended)?.id || designs[1]?.id || designs[0]?.id,
    latest_scenario: {
      weights: { sustainability: 40, protection: 30, cost: 15, logistics: 10, brand: 5 },
      constraints: {
        transport_distance_km: newProduct.transport_distance_km,
        budget: newProduct.target_cost || 20,
        carbon_target: 1.2,
        min_protection: 85,
      },
    },
    metrics: {
      carbon_reduction_pct: 32,
      cost_optimization_pct: 18,
      protection_score: 94,
    },
  };

  const saved = db.saveProject(newProject);
  res.status(201).json(saved);
});

apiRouter.get('/projects/:id', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

apiRouter.put('/projects/:id', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const updated = db.saveProject({
    ...project,
    ...req.body,
    updated_at: new Date().toISOString(),
  });
  res.json(updated);
});

apiRouter.delete('/projects/:id', (req: Request, res: Response) => {
  const success = db.deleteProject(req.params.id);
  if (!success) return res.status(404).json({ error: 'Project not found' });
  res.json({ success: true, message: 'Project deleted successfully' });
});

apiRouter.post('/projects/:id/duplicate', (req: Request, res: Response) => {
  const duplicated = db.duplicateProject(req.params.id);
  if (!duplicated) return res.status(404).json({ error: 'Project not found' });
  res.status(201).json(duplicated);
});

// ==================== MATERIALS ====================
apiRouter.get('/materials', (req: Request, res: Response) => {
  res.json(db.getAllMaterials());
});

// ==================== PACKAGING GENERATOR & CALCULATIONS ====================
apiRouter.post('/packaging/generate', (req: Request, res: Response) => {
  const { product } = req.body;
  if (!product) return res.status(400).json({ error: 'Product payload required' });
  const options = generatePackagingOptions(product);
  res.json(options);
});

apiRouter.post('/packaging/calculate', (req: Request, res: Response) => {
  const {
    material_id,
    length_mm,
    width_mm,
    height_mm,
    thickness_mm,
    cushioning_mm,
    internal_clearance_mm,
    geometry,
    orientation,
    transport_distance_km,
    transport_mode,
    product_weight_g,
    product_fragility,
    annual_quantity,
  } = req.body;

  if (!material_id || !length_mm || !width_mm || !height_mm) {
    return res.status(400).json({ error: 'Missing required dimensional or material parameters' });
  }

  const result = recalculatePackagingMetrics({
    material_id,
    length_mm: Number(length_mm),
    width_mm: Number(width_mm),
    height_mm: Number(height_mm),
    thickness_mm: Number(thickness_mm) || 2.8,
    cushioning_mm: Number(cushioning_mm) || 16.0,
    internal_clearance_mm: Number(internal_clearance_mm) || 2.0,
    geometry,
    orientation,
    transport_distance_km: Number(transport_distance_km) || 500,
    transport_mode: transport_mode || 'Road',
    product_weight_g: Number(product_weight_g) || 450,
    product_fragility: product_fragility || 'Medium',
    annual_quantity: Number(annual_quantity) || 25000,
  });

  res.json(result);
});

// ==================== COST ENGINE ====================
apiRouter.post('/cost/calculate', (req: Request, res: Response) => {
  const {
    material_id,
    length_mm,
    width_mm,
    height_mm,
    thickness_mm,
    cushioning_mm,
    transport_distance_km,
    transport_mode,
    annual_quantity,
    expected_volume,
  } = req.body;

  const material = db.getAllMaterials().find(m => m.id === material_id) || db.getAllMaterials()[0];
  const breakdown = calculateCost({
    material,
    length_mm: Number(length_mm) || 80,
    width_mm: Number(width_mm) || 80,
    height_mm: Number(height_mm) || 250,
    thickness_mm: Number(thickness_mm) || 2.8,
    cushioning_mm: Number(cushioning_mm) || 15.0,
    transport_distance_km: Number(transport_distance_km) || 500,
    transport_mode: transport_mode || 'Road',
    annual_quantity: Number(annual_quantity || expected_volume) || 25000,
  });

  res.json(breakdown);
});

// ==================== CARBON ENGINE ====================
apiRouter.post('/carbon/calculate', (req: Request, res: Response) => {
  const {
    material_id,
    packageWeight_g,
    transport_distance_km,
    transport_mode,
    recyclability_pct,
    total_packages,
  } = req.body;

  const material = db.getAllMaterials().find(m => m.id === material_id) || db.getAllMaterials()[0];
  const breakdown = calculateCarbon({
    material,
    packageWeight_g: Number(packageWeight_g) || 200,
    transport_distance_km: Number(transport_distance_km) || 500,
    transport_mode: transport_mode || 'Road',
    recyclability_pct: Number(recyclability_pct) || material.recyclability_pct,
    total_packages: Number(total_packages) || 25000,
  });

  res.json(breakdown);
});

// ==================== PROTECTION & VIRTUAL VALIDATION LAB ====================
apiRouter.post('/protection/score', (req: Request, res: Response) => {
  const {
    material_id,
    product_weight_g,
    product_fragility,
    thickness_mm,
    cushioning_mm,
    internal_clearance_mm,
    geometry,
  } = req.body;

  const material = db.getAllMaterials().find(m => m.id === material_id) || db.getAllMaterials()[0];
  const result = calculateProtectionScore({
    material,
    product_weight_g: Number(product_weight_g) || 450,
    product_fragility: product_fragility || 'Medium',
    thickness_mm: Number(thickness_mm) || 2.8,
    cushioning_mm: Number(cushioning_mm) || 16.0,
    internal_clearance_mm: Number(internal_clearance_mm) || 2.0,
    geometry: geometry || 'Standard Rectangular',
  });

  res.json(result);
});

// Drop Test
const handleDropTestSimulate = (req: Request, res: Response) => {
  const {
    material_id,
    materialId,
    product_weight_g,
    productWeight_g,
    product_fragility,
    productFragility,
    drop_height_m,
    dropHeight_m,
    surface,
    dropSurface,
    orientation,
    dropOrientation,
    cushioning_mm,
    thickness_mm,
  } = req.body;

  const matId = material_id || materialId;
  const material = db.getAllMaterials().find(m => m.id === matId) || db.getAllMaterials()[0];
  const result = simulateDropTest({
    material,
    product_weight_g: Number(product_weight_g || productWeight_g) || 450,
    product_fragility: product_fragility || productFragility || 'Medium',
    drop_height_m: Number(drop_height_m || dropHeight_m) || 1.2,
    surface: surface || dropSurface || 'Concrete',
    orientation: orientation || dropOrientation || 'Corner',
    cushioning_mm: Number(cushioning_mm) || 16,
    thickness_mm: Number(thickness_mm) || 2.8,
  });

  res.json(result);
};

apiRouter.post('/drop-test/simulate', handleDropTestSimulate);
apiRouter.post('/drop-test', handleDropTestSimulate);

// Compression Test
apiRouter.post('/compression-test/simulate', (req: Request, res: Response) => {
  const {
    stack_height_boxes,
    duration_days,
    material_strength_mpa,
    package_weight_kg,
    perimeter_mm,
    thickness_mm,
  } = req.body;

  const result = simulateCompressionTest({
    stack_height_boxes: Number(stack_height_boxes) || 6,
    duration_days: Number(duration_days) || 30,
    material_strength_mpa: Number(material_strength_mpa) || 42,
    package_weight_kg: Number(package_weight_kg) || 0.65,
    perimeter_mm: Number(perimeter_mm) || 600,
    thickness_mm: Number(thickness_mm) || 3.0,
  });

  res.json(result);
});

// Vibration Test
apiRouter.post('/vibration-test/simulate', (req: Request, res: Response) => {
  const { transport_mode, distance_km, duration_hours, cushioning_mm } = req.body;
  const result = simulateVibrationTest({
    transport_mode: transport_mode || 'Road',
    distance_km: Number(distance_km) || 500,
    duration_hours: duration_hours ? Number(duration_hours) : undefined,
    cushioning_mm: Number(cushioning_mm) || 16,
  });
  res.json(result);
});

// ==================== LOGISTICS & CARBON ====================
apiRouter.post('/logistics/calculate', (req: Request, res: Response) => {
  const {
    length_mm,
    width_mm,
    height_mm,
    package_weight_g,
    number_of_packages,
    transport_distance_km,
    transport_mode,
  } = req.body;

  const result = calculateLogistics({
    length_mm: Number(length_mm) || 120,
    width_mm: Number(width_mm) || 120,
    height_mm: Number(height_mm) || 290,
    package_weight_g: Number(package_weight_g) || 220,
    number_of_packages: Number(number_of_packages) || 25000,
    transport_distance_km: Number(transport_distance_km) || 500,
    transport_mode: transport_mode || 'Road',
  });

  res.json(result);
});

// ==================== OPTIMIZATION & DECISION MATRIX ====================
apiRouter.post('/optimization/run', (req: Request, res: Response) => {
  const { projectId, designs: clientDesigns, weights, constraints, mode } = req.body;

  let designs = clientDesigns;
  if (!designs || designs.length === 0) {
    const project = db.getProjectById(projectId || 'proj_smart_bottle');
    designs = project?.designs || [];
  }

  const defaultWeights: ScenarioWeights = weights || {
    sustainability: 20,
    protection: 30,
    cost: 20,
    logistics: 15,
    material_efficiency: 15,
  };
  const defaultConstraints: ScenarioConstraints = constraints || {
    transport_distance_km: 500,
    budget: 20,
    carbon_target: 1.0,
    min_protection: 90,
    min_recyclability: 80,
  };

  const optimizationMode: OptimizationMode = mode || 'Balanced';
  const result = runOptimization(designs, defaultWeights, defaultConstraints, optimizationMode);
  res.json(result);
});

// ==================== SCENARIO SIMULATOR ====================
apiRouter.post('/scenarios/simulate', (req: Request, res: Response) => {
  const {
    projectId,
    scenarioName,
    designs: clientDesigns,
    weights,
    constraints,
    previousBestId,
  } = req.body;

  let designs = clientDesigns;
  if (!designs || designs.length === 0) {
    const project = db.getProjectById(projectId || 'proj_smart_bottle');
    designs = project?.designs || [];
  }

  const result = simulateScenario({
    projectId: projectId || 'proj_smart_bottle',
    scenarioName: scenarioName || 'Custom Scenario',
    designs,
    weights: weights || { sustainability: 40, protection: 30, cost: 15, logistics: 10, brand: 5 },
    constraints: constraints || { transport_distance_km: 500, budget: 20, carbon_target: 1.0, min_protection: 90 },
    previousBestId,
  });

  res.json(result);
});

apiRouter.get('/scenarios/presets', (req: Request, res: Response) => {
  res.json(PRESET_SCENARIOS);
});

// ==================== RECOMMENDATIONS ====================
apiRouter.get('/recommendations/:projectId', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const weights = project.latest_scenario?.weights || {
    sustainability: 20,
    protection: 30,
    cost: 20,
    logistics: 15,
    brand: 10,
    material_efficiency: 15,
  };
  const constraints = project.latest_scenario?.constraints || {
    transport_distance_km: project.product.transport_distance_km,
    budget: project.product.target_cost || 20,
    carbon_target: 1.0,
    min_protection: 90,
  };

  const optimization = runOptimization(project.designs, weights, constraints, 'Balanced');

  res.json({
    projectId: project.id,
    projectName: project.name,
    product: project.product,
    recommendedPackage: optimization.bestSolution,
    decisionScore: optimization.decisionScore,
    whyThisPackage: optimization.summaryExplanation,
    recommendationDetails: optimization.recommendationDetails,
    whyNotOthers: optimization.rejectedSolutions.map(r => ({
      name: r.design.name,
      material: r.design.material_name,
      reasons: r.reasons,
    })),
    topAlternatives: optimization.topAlternatives,
  });
});

// ==================== COMPLIANCE CENTER ====================
apiRouter.get('/compliance', (req: Request, res: Response) => {
  const { region, category } = req.query;
  let rules = [...COMPLIANCE_DATABASE];
  if (region && region !== 'All') {
    rules = rules.filter(r => r.region.toLowerCase().includes(String(region).toLowerCase()));
  }
  if (category && category !== 'All') {
    rules = rules.filter(r => r.category.toLowerCase().includes(String(category).toLowerCase()));
  }
  res.json({
    rules,
    disclaimer: 'Regulatory information is decision support only. Verify with the relevant authority or qualified compliance professional.',
  });
});

// ==================== SUPPLIER ENGINE ====================
apiRouter.get('/suppliers', (req: Request, res: Response) => {
  const { material, location, maxMoq } = req.query;
  let suppliers = [...DEMO_SUPPLIERS];
  if (material && material !== 'All') {
    suppliers = suppliers.filter(s => s.materials_supplied.some(m => m.toLowerCase().includes(String(material).toLowerCase())));
  }
  if (location && location !== 'All') {
    suppliers = suppliers.filter(s => s.location.toLowerCase().includes(String(location).toLowerCase()));
  }
  if (maxMoq) {
    suppliers = suppliers.filter(s => s.min_order_qty <= Number(maxMoq));
  }
  res.json({
    suppliers,
    mode: 'DEMO SUPPLIER DATA',
  });
});

// ==================== GLOBAL BENCHMARKING ====================
apiRouter.get('/benchmarks', (req: Request, res: Response) => {
  const { cost, carbon, protection, weight, volume, matEff } = req.query;
  const benchmarks = getGlobalBenchmarks({
    cost: Number(cost) || 17.80,
    carbon: Number(carbon) || 0.68,
    protection: Number(protection) || 94,
    weight_g: Number(weight) || 195,
    volume_l: Number(volume) || 1.85,
    material_efficiency: Number(matEff) || 86,
  });
  res.json({
    benchmarks,
    notes: 'Comparison against verified European & North American EPD datasets and industry averages. Clearly labelled as DEMO/VERIFIED DATA.',
  });
});

// ==================== ECHOCOPILOT AI ADVISOR ====================
apiRouter.post('/ai/advisor', async (req: Request, res: Response) => {
  const { userQuery, projectId, activeDesignId } = req.body;
  if (!userQuery) return res.status(400).json({ error: 'Query is required' });

  try {
    const response = await askAdvisor({ userQuery, projectId, activeDesignId });
    res.json(response);
  } catch (err: any) {
    res.status(500).json({
      error: 'EchoCopilot encountered an error',
      details: err?.message || String(err),
    });
  }
});

// ==================== DEMO RESET ====================
apiRouter.post('/demo/reset', (req: Request, res: Response) => {
  db.seedDatabase();
  const smartBottle = db.getProjectById('proj_smart_bottle');
  res.json({
    success: true,
    message: 'EchoPack demo database re-seeded successfully',
    project: smartBottle,
  });
});
