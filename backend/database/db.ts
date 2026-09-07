import {
  User,
  Project,
  Product,
  PackagingDesign,
  DropTestResult,
  OptimizationResult,
  Material,
} from '../../src/types.js';
import { SEEDED_MATERIALS } from '../data/materials.js';
import { generatePackagingOptions } from '../services/packagingService.js';
import { simulateDropTest } from '../services/protectionService.js';
import { runOptimization } from '../services/optimizationService.js';

// Relational in-memory & persisted database tables
class EcoPackDatabase {
  users: Map<string, User> = new Map();
  projects: Map<string, Project> = new Map();
  products: Map<string, Product> = new Map();
  materials: Map<string, Material> = new Map();
  packaging_designs: Map<string, PackagingDesign> = new Map();
  drop_tests: Map<string, DropTestResult> = new Map();
  optimization_results: Map<string, OptimizationResult> = new Map();

  constructor() {
    this.seedDatabase();
  }

  seedDatabase() {
    // 1. Seed Materials
    for (const mat of SEEDED_MATERIALS) {
      this.materials.set(mat.id, mat);
    }

    // 2. Seed Demo User
    const demoUser: User = {
      id: 'usr_demo_1',
      email: 'demo@ecopack.io',
      name: 'Alex Morgan',
      role: 'Packaging Decision Architect',
    };
    this.users.set(demoUser.id, demoUser);

    // 3. Seed Primary WOW Demo Project: Smart Bottle
    const smartBottleProduct: Product = {
      id: 'prod_smart_bottle',
      project_id: 'proj_smart_bottle',
      name: 'Smart Bottle with Sensor Core',
      category: 'Smart Hardware & Consumer Goods',
      length_mm: 80,
      width_mm: 80,
      height_mm: 250,
      weight_g: 450,
      fragility: 'Medium',
      budget: 20.0,
      expected_volume: 25000,
      brand_style: 'Eco-conscious',
      transport_distance_km: 500,
      transport_mode: 'Road',
    };
    this.products.set(smartBottleProduct.id, smartBottleProduct);

    const smartBottleDesigns = generatePackagingOptions(smartBottleProduct);
    for (const d of smartBottleDesigns) {
      this.packaging_designs.set(d.id, d);
    }

    const smartBottleProject: Project = {
      id: 'proj_smart_bottle',
      name: 'Smart Bottle',
      description: 'Connected vacuum-insulated stainless hydration bottle with internal IoT cap sensor.',
      created_at: new Date(Date.now() - 3600 * 24 * 3 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      status: 'Optimized',
      product: smartBottleProduct,
      designs: smartBottleDesigns,
      selected_design_id: smartBottleDesigns.find(d => d.name.includes('Hybrid'))?.id || smartBottleDesigns[0].id,
      latest_scenario: {
        weights: { sustainability: 40, protection: 30, cost: 15, logistics: 10, brand: 5 },
        constraints: { transport_distance_km: 500, budget: 20, carbon_target: 1.0, min_protection: 90 },
      },
      metrics: {
        carbon_reduction_pct: 32,
        cost_optimization_pct: 18,
        protection_score: 94,
      },
    };
    this.projects.set(smartBottleProject.id, smartBottleProject);

    // 4. Seed Electronics Box
    const elecProduct: Product = {
      id: 'prod_elec_box',
      project_id: 'proj_elec_box',
      name: 'Precision IoT Gateway Device',
      category: 'Industrial Electronics',
      length_mm: 180,
      width_mm: 120,
      height_mm: 60,
      weight_g: 320,
      fragility: 'High',
      budget: 28.0,
      expected_volume: 15000,
      brand_style: 'Minimal',
      transport_distance_km: 800,
      transport_mode: 'Road',
    };
    this.products.set(elecProduct.id, elecProduct);
    const elecDesigns = generatePackagingOptions(elecProduct);
    for (const d of elecDesigns) this.packaging_designs.set(d.id, d);

    this.projects.set('proj_elec_box', {
      id: 'proj_elec_box',
      name: 'Electronics Box',
      description: 'Ruggedized edge compute gateway with sensitive optical sensors.',
      created_at: new Date(Date.now() - 3600 * 24 * 7 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3600 * 24 * 2 * 1000).toISOString(),
      status: 'Simulated',
      product: elecProduct,
      designs: elecDesigns,
      selected_design_id: elecDesigns[1].id,
      metrics: {
        carbon_reduction_pct: 26,
        cost_optimization_pct: 14,
        protection_score: 91,
      },
    });

    // 5. Seed Cosmetic Package
    const cosmProduct: Product = {
      id: 'prod_cosm_pkg',
      project_id: 'proj_cosm_pkg',
      name: 'Botanical Serum Flask',
      category: 'Personal Care & Beauty',
      length_mm: 50,
      width_mm: 50,
      height_mm: 120,
      weight_g: 160,
      fragility: 'Medium',
      budget: 18.0,
      expected_volume: 40000,
      brand_style: 'Premium',
      transport_distance_km: 350,
      transport_mode: 'Road',
    };
    this.products.set(cosmProduct.id, cosmProduct);
    const cosmDesigns = generatePackagingOptions(cosmProduct);
    for (const d of cosmDesigns) this.packaging_designs.set(d.id, d);

    this.projects.set('proj_cosm_pkg', {
      id: 'proj_cosm_pkg',
      name: 'Cosmetic Package',
      description: 'Luxury organic facial essence in lightweight amber glass container.',
      created_at: new Date(Date.now() - 3600 * 24 * 12 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3600 * 24 * 4 * 1000).toISOString(),
      status: 'Optimized',
      product: cosmProduct,
      designs: cosmDesigns,
      selected_design_id: cosmDesigns[3].id,
      metrics: {
        carbon_reduction_pct: 35,
        cost_optimization_pct: 12,
        protection_score: 89,
      },
    });

    // 6. Seed Food Container
    const foodProduct: Product = {
      id: 'prod_food_box',
      project_id: 'proj_food_box',
      name: 'Artisan Confectionery Box',
      category: 'Food & Beverage',
      length_mm: 140,
      width_mm: 140,
      height_mm: 80,
      weight_g: 280,
      fragility: 'Low',
      budget: 14.0,
      expected_volume: 60000,
      brand_style: 'Standard',
      transport_distance_km: 200,
      transport_mode: 'Road',
    };
    this.products.set(foodProduct.id, foodProduct);
    const foodDesigns = generatePackagingOptions(foodProduct);
    for (const d of foodDesigns) this.packaging_designs.set(d.id, d);

    this.projects.set('proj_food_box', {
      id: 'proj_food_box',
      name: 'Food Container',
      description: 'Thermal-barrier compostable packaging for fragile organic chocolates.',
      created_at: new Date(Date.now() - 3600 * 24 * 16 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3600 * 24 * 6 * 1000).toISOString(),
      status: 'Simulated',
      product: foodProduct,
      designs: foodDesigns,
      selected_design_id: foodDesigns[0].id,
      metrics: {
        carbon_reduction_pct: 22,
        cost_optimization_pct: 16,
        protection_score: 86,
      },
    });
  }

  getAllProjects(): Project[] {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.get(id);
  }

  saveProject(project: Project): Project {
    project.updated_at = new Date().toISOString();
    this.projects.set(project.id, project);
    if (project.product) {
      this.products.set(project.product.id, project.product);
    }
    if (project.designs) {
      for (const d of project.designs) {
        this.packaging_designs.set(d.id, d);
      }
    }
    return project;
  }

  deleteProject(id: string): boolean {
    const proj = this.projects.get(id);
    if (!proj) return false;
    this.projects.delete(id);
    if (proj.product) this.products.delete(proj.product.id);
    if (proj.designs) {
      for (const d of proj.designs) {
        this.packaging_designs.delete(d.id);
      }
    }
    return true;
  }

  duplicateProject(id: string): Project | undefined {
    const source = this.projects.get(id);
    if (!source) return undefined;

    const newId = `proj_${Date.now()}`;
    const newProdId = `prod_${Date.now()}`;
    const newProduct: Product = {
      ...source.product,
      id: newProdId,
      project_id: newId,
      name: `${source.product.name} (Copy)`,
    };

    const newDesigns: PackagingDesign[] = source.designs.map((d, idx) => ({
      ...d,
      id: `pkg_${Date.now()}_${idx}`,
      project_id: newId,
    }));

    const duplicated: Project = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product: newProduct,
      designs: newDesigns,
      selected_design_id: newDesigns[0]?.id,
    };

    return this.saveProject(duplicated);
  }

  getAllMaterials(): Material[] {
    return Array.from(this.materials.values());
  }

  getPackagingDesignById(id: string): PackagingDesign | undefined {
    return this.packaging_designs.get(id);
  }

  savePackagingDesign(design: PackagingDesign): PackagingDesign {
    this.packaging_designs.set(design.id, design);
    // Also update in parent project if exists
    const project = this.projects.get(design.project_id);
    if (project) {
      const idx = project.designs.findIndex(d => d.id === design.id);
      if (idx >= 0) {
        project.designs[idx] = design;
      } else {
        project.designs.push(design);
      }
      this.saveProject(project);
    }
    return design;
  }
}

export const db = new EcoPackDatabase();
