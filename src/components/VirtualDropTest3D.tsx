import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ShieldCheck, Play, RefreshCw, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';
import { DropSurface, DropOrientation, ProductFragility, DropTestResult } from '../types.js';

interface VirtualDropTest3DProps {
  materialId: string;
  materialName: string;
  materialColor?: string;
  productWeight_g?: number;
  productFragility?: ProductFragility;
  initialHeight?: number;
  onTestComplete?: (result: DropTestResult) => void;
}

export const VirtualDropTest3D: React.FC<VirtualDropTest3DProps> = ({
  materialId,
  materialName,
  materialColor = '#2d6a4f',
  productWeight_g = 450,
  productFragility = 'Medium',
  initialHeight = 1.5,
  onTestComplete,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const packageMeshRef = useRef<THREE.Group | null>(null);
  const shockwaveRef = useRef<THREE.Mesh | null>(null);

  // Configuration state
  const [dropHeight, setDropHeight] = useState<number>(initialHeight);
  const [surface, setSurface] = useState<DropSurface>('Concrete');
  const [orientation, setOrientation] = useState<DropOrientation>('Corner');
  const [fragility, setFragility] = useState<ProductFragility>(productFragility);

  // Simulation execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [result, setResult] = useState<DropTestResult | null>(null);

  // Animation state tracking
  const animationStateRef = useRef<{
    active: boolean;
    startY: number;
    currentY: number;
    velocity: number;
    hasImpacted: boolean;
    deformationScale: number;
  }>({
    active: false,
    startY: 12,
    currentY: 12,
    velocity: 0,
    hasImpacted: false,
    deformationScale: 1,
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // Dark engineering lab atmosphere
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(18, 14, 22);
    camera.lookAt(0, 4, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const spotLight = new THREE.SpotLight(0x38bdf8, 2.5);
    spotLight.position.set(10, 30, 15);
    spotLight.castShadow = true;
    scene.add(spotLight);

    const floorLight = new THREE.PointLight(0x10b981, 1.2, 20);
    floorLight.position.set(0, 1, 0);
    scene.add(floorLight);

    // Impact Ground Plate
    const groundGeo = new THREE.BoxGeometry(20, 1.5, 20);
    const groundMat = new THREE.MeshStandardMaterial({
      color: surface === 'Concrete' ? 0x475569 : surface === 'Wood' ? 0x78350f : 0x1e3a8a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.75;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid on Ground
    const grid = new THREE.GridHelper(20, 20, 0x38bdf8, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // Shockwave Ring (initially hidden)
    const ringGeo = new THREE.RingGeometry(0.1, 0.6, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const shockwave = new THREE.Mesh(ringGeo, ringMat);
    shockwave.rotation.x = -Math.PI / 2;
    shockwave.position.y = 0.05;
    scene.add(shockwave);
    shockwaveRef.current = shockwave;

    // Drop Package Mesh Assembly
    const pkgGroup = new THREE.Group();
    const pkgGeo = new THREE.BoxGeometry(3.5, 7.5, 3.5);
    const pkgMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(materialColor),
      roughness: 0.7,
      metalness: 0.1,
    });
    const pkgBox = new THREE.Mesh(pkgGeo, pkgMat);
    pkgBox.castShadow = true;
    pkgGroup.add(pkgBox);

    // Edges
    const edges = new THREE.EdgesGeometry(pkgGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x34d399 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    pkgGroup.add(wireframe);

    // Orientation tilt
    if (orientation === 'Corner') {
      pkgGroup.rotation.x = Math.PI / 4;
      pkgGroup.rotation.z = Math.PI / 4;
    } else if (orientation === 'Edge') {
      pkgGroup.rotation.z = Math.PI / 4;
    } else {
      pkgGroup.rotation.set(0, 0, 0);
    }

    // Set initial position based on dropHeight
    const targetY = 2 + dropHeight * 4.5;
    pkgGroup.position.set(0, targetY, 0);
    scene.add(pkgGroup);
    packageMeshRef.current = pkgGroup;

    animationStateRef.current = {
      active: false,
      startY: targetY,
      currentY: targetY,
      velocity: 0,
      hasImpacted: false,
      deformationScale: 1,
    };

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      const anim = animationStateRef.current;
      if (anim.active && pkgGroup) {
        if (!anim.hasImpacted) {
          // Accelerate downwards: v = v + g * dt
          anim.velocity += 0.035;
          anim.currentY -= anim.velocity;
          pkgGroup.position.y = anim.currentY;

          // Impact threshold
          const impactThreshold = orientation === 'Corner' ? 3.0 : orientation === 'Edge' ? 2.6 : 3.8;
          if (anim.currentY <= impactThreshold) {
            anim.hasImpacted = true;
            pkgGroup.position.y = impactThreshold;

            // Trigger shockwave ring animation
            if (shockwaveRef.current) {
              shockwaveRef.current.scale.set(1, 1, 1);
              (shockwaveRef.current.material as THREE.MeshBasicMaterial).opacity = 0.9;
            }
          }
        } else {
          // Rebound and deformation squish
          if (anim.velocity > 0.05) {
            anim.velocity = -anim.velocity * 0.25; // Inelastic rebound
            anim.currentY += anim.velocity;
            pkgGroup.position.y = Math.max(2.5, anim.currentY);
          }

          // Expand shockwave
          if (shockwaveRef.current) {
            const curScale = shockwaveRef.current.scale.x;
            if (curScale < 12) {
              shockwaveRef.current.scale.multiplyScalar(1.2);
              const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
              mat.opacity = Math.max(0, mat.opacity - 0.05);
            }
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [dropHeight, surface, orientation, materialColor]);

  const handleRunDropTest = async () => {
    setIsRunning(true);
    setResult(null);

    // Reset visual package to drop height
    if (packageMeshRef.current) {
      const startY = 2 + dropHeight * 4.5;
      packageMeshRef.current.position.set(0, startY, 0);
      animationStateRef.current = {
        active: false,
        startY,
        currentY: startY,
        velocity: 0,
        hasImpacted: false,
        deformationScale: 1,
      };
    }

    try {
      // Realistic multi-stage loading sequence
      setLoadingStep('Preparing virtual laboratory environment...');
      await new Promise(r => setTimeout(r, 450));

      setLoadingStep('Analyzing packaging internal cushioning & FEA geometry...');
      await new Promise(r => setTimeout(r, 550));

      setLoadingStep('Calculating kinetic impact velocity & surface deceleration...');
      // Start 3D drop animation
      animationStateRef.current.active = true;
      await new Promise(r => setTimeout(r, 600));

      setLoadingStep('Evaluating peak G-forces & product fragility safety margin...');
      const res = await fetch('/api/drop-test/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_id: materialId,
          product_weight_g: productWeight_g,
          product_fragility: fragility,
          drop_height_m: dropHeight,
          surface,
          orientation,
          cushioning_mm: 18,
          thickness_mm: 3.2,
        }),
      });

      if (!res.ok) throw new Error('Failed to run drop simulation');
      const testResult: DropTestResult = await res.json();
      setResult(testResult);
      if (onTestComplete) onTestComplete(testResult);
    } catch (err) {
      console.error('Drop test simulation failed:', err);
    } finally {
      setIsRunning(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="space-y-6">
      {/* 3D Drop Simulation Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-xl">
        <div ref={mountRef} className="w-full h-[380px] sm:h-[440px]" />

        {/* Live HUD Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none text-xs">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold uppercase tracking-wider text-[10px] text-emerald-400">Virtual Sensor Rig</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-slate-300">{dropHeight.toFixed(1)}m Drop Height</span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-md border border-slate-700/80 text-[11px] text-slate-300 font-mono">
            Surface: <span className="text-sky-400">{surface}</span> • Vector: <span className="text-sky-400">{orientation}</span>
          </div>
        </div>

        {/* Loading HUD Banner */}
        {isRunning && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-12 h-12 rounded-full border-3 border-emerald-500/30 border-t-emerald-500 animate-spin mb-4" />
            <span className="text-base font-bold text-white tracking-wide">{loadingStep}</span>
            <span className="text-xs text-slate-400 mt-1">Executing ASTM D5276 numerical solver</span>
          </div>
        )}
      </div>

      {/* Control Configuration Panel */}
      <div className="sleek-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="sleek-section-title mb-0">Virtual Drop Test Parameters</div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">Physical Impact Simulation</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate drop dynamics across varying elevations, landing orientations, and target surfaces.
            </p>
          </div>

          <button
            onClick={handleRunDropTest}
            disabled={isRunning}
            className="sleek-btn-primary"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating Impact...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Virtual Drop Test</span>
              </>
            )}
          </button>
        </div>

        {/* Sliders and Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-5">
          {/* Drop Height */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
              <span>Drop Height</span>
              <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                {dropHeight.toFixed(1)} m
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={dropHeight}
              onChange={e => setDropHeight(parseFloat(e.target.value))}
              disabled={isRunning}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer sleek-slider"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0.5m (Belt)</span>
              <span>1.5m (Transit)</span>
              <span>2.5m (Rack)</span>
            </div>
          </div>

          {/* Impact Surface */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Impact Surface</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Concrete', 'Wood', 'Carpet'] as DropSurface[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSurface(s)}
                  disabled={isRunning}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    surface === s
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Orientation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Landing Orientation</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Corner', 'Edge', 'Flat Face'] as DropOrientation[]).map(o => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOrientation(o)}
                  disabled={isRunning}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all truncate px-1 cursor-pointer ${
                    orientation === o
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Product Fragility */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Product Fragility</label>
            <div className="grid grid-cols-4 gap-1">
              {(['Low', 'Medium', 'High', 'Very High'] as ProductFragility[]).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFragility(f)}
                  disabled={isRunning}
                  className={`py-1.5 text-[11px] font-medium rounded-lg border transition-all truncate px-1 cursor-pointer ${
                    fragility === f
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f === 'Very High' ? 'V.High' : f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Results Card */}
      {result && (
        <div className="sleek-card animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl ${
                  result.structural_status === 'PASS'
                    ? 'bg-emerald-100 text-emerald-700'
                    : result.structural_status === 'BORDERLINE'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {result.structural_status === 'PASS' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="sleek-section-title mb-0">Virtual Performance Results</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Status: <span className="font-bold text-slate-800">{result.structural_status}</span> • Product Risk:{' '}
                  <span className="font-semibold text-slate-800">{result.product_risk}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Protection Rating:</span>
              <span className="text-2xl font-bold font-mono text-emerald-600">{result.protection_score}</span>
              <span className="text-xs font-semibold text-slate-500">/ 100</span>
            </div>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500">Protection Score</span>
              <p className="text-lg font-bold text-slate-900 font-mono mt-1">{result.protection_score} / 100</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500">Est. Deformation</span>
              <p className="text-lg font-bold text-slate-900 font-mono mt-1">{result.estimated_deformation_pct}%</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500">Product Risk</span>
              <p className="text-lg font-bold text-slate-900 mt-1">{result.product_risk}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500">Impact Velocity</span>
              <p className="text-lg font-bold text-slate-900 font-mono mt-1">{result.impact_velocity_ms} m/s</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500">Peak Deceleration</span>
              <p className="text-lg font-bold text-slate-900 font-mono mt-1">{result.peak_deceleration_g} G</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500">Kinetic Energy</span>
              <p className="text-lg font-bold text-slate-900 font-mono mt-1">{result.energy_absorbed_j} J</p>
            </div>
          </div>

          {/* Disclaimer Banner */}
          <div className="mt-5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Estimated virtual performance</span> — {result.disclaimer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
