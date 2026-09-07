import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Eye, Layers, Maximize2 } from 'lucide-react';

interface Packaging3DViewerProps {
  length_mm: number;
  width_mm: number;
  height_mm: number;
  thickness_mm?: number;
  cushioning_mm?: number;
  materialColor?: string;
  materialName?: string;
  productType?: 'bottle' | 'box';
  exploded?: boolean;
  showCalipers?: boolean;
  className?: string;
  metrics?: {
    carbon_footprint?: number;
    estimated_cost?: number;
    protection_score?: number;
    recyclability?: number;
  };
}

export const Packaging3DViewer: React.FC<Packaging3DViewerProps> = ({
  length_mm,
  width_mm,
  height_mm,
  thickness_mm = 3,
  cushioning_mm = 15,
  materialColor = '#c29b6e',
  materialName = 'Corrugated Board',
  productType = 'bottle',
  exploded = false,
  showCalipers = false,
  className = 'w-full h-[400px]',
  metrics,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const packageGroupRef = useRef<THREE.Group | null>(null);
  const cushionGroupRef = useRef<THREE.Group | null>(null);
  const productMeshRef = useRef<THREE.Mesh | THREE.Group | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [explodedState, setExplodedState] = useState<boolean>(exploded);

  useEffect(() => {
    setExplodedState(exploded);
  }, [exploded]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(24, 20, 28);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(20, 40, 20);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa5b4fc, 0.4);
    dirLight2.position.set(-20, -10, -20);
    scene.add(dirLight2);

    // Subtle floor shadow receiver
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -8;
    floor.receiveShadow = true;
    scene.add(floor);

    // Floor grid
    const grid = new THREE.GridHelper(50, 25, 0xd1d5db, 0xe5e7eb);
    grid.position.y = -7.95;
    scene.add(grid);

    // Root Assembly Group
    const rootAssembly = new THREE.Group();
    scene.add(rootAssembly);
    packageGroupRef.current = rootAssembly;

    // 5. Build geometry according to dimensions
    updateAssemblyGeometry(rootAssembly, length_mm, width_mm, height_mm, thickness_mm, cushioning_mm, materialColor, materialName, productType, explodedState);

    // 6. Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (rootAssembly && autoRotate && !isDraggingRef.current) {
        rootAssembly.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    // 7. Mouse/Touch interactions for orbit rotation
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !rootAssembly) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      rootAssembly.rotation.y += deltaX * 0.01;
      rootAssembly.rotation.x += deltaY * 0.01;
      // Clamp vertical tilt
      rootAssembly.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rootAssembly.rotation.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!camera) return;
      const zoomFactor = e.deltaY * 0.02;
      const newDist = camera.position.length() + zoomFactor;
      if (newDist > 12 && newDist < 80) {
        camera.position.setLength(newDist);
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Resize observer
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
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [length_mm, width_mm, height_mm, thickness_mm, cushioning_mm, materialColor, materialName, productType, explodedState]);

  const updateAssemblyGeometry = (
    root: THREE.Group,
    l_mm: number,
    w_mm: number,
    h_mm: number,
    thick_mm: number,
    cush_mm: number,
    color: string,
    matName: string,
    prodType: string,
    isExploded: boolean
  ) => {
    // Clear previous children
    while (root.children.length > 0) {
      root.remove(root.children[0]);
    }

    // Normalizing scale: 100mm = 4 Three.js units
    const scale = 0.04;
    const l = Math.max(2, l_mm * scale);
    const w = Math.max(2, w_mm * scale);
    const h = Math.max(3, h_mm * scale);
    const c = Math.max(0.4, cush_mm * scale);
    const t = Math.max(0.15, thick_mm * scale);

    const outerL = l + 2 * (c + t);
    const outerW = w + 2 * (c + t);
    const outerH = h + 2 * (c + t);

    // 1. Outer Shell (Cardboard / Molded Pulp Box with Flaps)
    const boxGroup = new THREE.Group();
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: matName.includes('Polymer') ? 0.3 : 0.82,
      metalness: matName.includes('Polymer') ? 0.1 : 0.05,
      transparent: matName.includes('Polymer'),
      opacity: matName.includes('Polymer') ? 0.85 : 1.0,
    });

    const isHybrid = matName.includes('Hybrid');

    if (isExploded) {
      // Create separated panels for exploded view
      const explodeDist = 3.2;

      // Bottom panel
      const btmGeo = new THREE.BoxGeometry(outerL, t, outerW);
      const btmMesh = new THREE.Mesh(btmGeo, boxMaterial);
      btmMesh.position.y = -(outerH / 2 + explodeDist);
      boxGroup.add(btmMesh);

      // Top panel
      const topMesh = btmMesh.clone();
      topMesh.position.y = outerH / 2 + explodeDist;
      boxGroup.add(topMesh);

      // Front & Back panels
      const fbGeo = new THREE.BoxGeometry(outerL, outerH, t);
      const frontMesh = new THREE.Mesh(fbGeo, boxMaterial);
      frontMesh.position.z = outerW / 2 + explodeDist;
      const backMesh = frontMesh.clone();
      backMesh.position.z = -(outerW / 2 + explodeDist);
      boxGroup.add(frontMesh);
      boxGroup.add(backMesh);

      // Left & Right panels
      const lrGeo = new THREE.BoxGeometry(t, outerH, outerW);
      const leftMesh = new THREE.Mesh(lrGeo, boxMaterial);
      leftMesh.position.x = -(outerL / 2 + explodeDist);
      const rightMesh = leftMesh.clone();
      rightMesh.position.x = outerL / 2 + explodeDist;
      boxGroup.add(leftMesh);
      boxGroup.add(rightMesh);
    } else {
      // Integrated semi-transparent or solid outer container box
      const boxGeo = new THREE.BoxGeometry(outerL, outerH, outerW);
      const boxMesh = new THREE.Mesh(boxGeo, boxMaterial);
      boxMesh.castShadow = true;
      boxMesh.receiveShadow = true;
      boxGroup.add(boxMesh);

      // Edge outline highlights
      const edges = new THREE.EdgesGeometry(boxGeo);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: isHybrid ? 0x059669 : 0x475569,
        linewidth: 2,
      });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      boxGroup.add(wireframe);

      // Brand Logo / Stamp Texture on Front face
      const stampGeo = new THREE.PlaneGeometry(outerL * 0.45, outerH * 0.25);
      const stampMat = new THREE.MeshBasicMaterial({
        color: 0x0f172a,
        transparent: true,
        opacity: 0.75,
      });
      const stamp = new THREE.Mesh(stampGeo, stampMat);
      stamp.position.z = outerW / 2 + 0.02;
      boxGroup.add(stamp);
    }
    root.add(boxGroup);

    // 2. Interior Cushioning Layer (Thermoformed molded cradle or honeycomb pad)
    const cushionGroup = new THREE.Group();
    const cushionMat = new THREE.MeshStandardMaterial({
      color: isHybrid ? 0xded4c3 : 0xf3f4f6,
      roughness: 0.95,
      wireframe: !isExploded && !matName.includes('Polymer'),
    });

    const innerL = l + 2 * c;
    const innerW = w + 2 * c;
    const innerH = h + 2 * c;

    const cushionGeo = new THREE.BoxGeometry(innerL, innerH, innerW);
    const cushionMesh = new THREE.Mesh(cushionGeo, cushionMat);
    cushionGroup.add(cushionMesh);
    root.add(cushionGroup);
    cushionGroupRef.current = cushionGroup;

    // 3. Inner Product (Smart Bottle or Gadget)
    if (prodType === 'bottle' || (l_mm <= 100 && w_mm <= 100 && h_mm >= 180)) {
      // Smart Bottle 3D Model
      const bottleGroup = new THREE.Group();

      // Main Bottle Cylinder
      const bottleRadius = Math.min(l, w) * 0.42;
      const bottleHeight = h * 0.75;
      const bodyGeo = new THREE.CylinderGeometry(bottleRadius, bottleRadius, bottleHeight, 32);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.25,
        metalness: 0.85,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.castShadow = true;
      bottleGroup.add(body);

      // Neck
      const neckRadius = bottleRadius * 0.55;
      const neckHeight = h * 0.12;
      const neckGeo = new THREE.CylinderGeometry(neckRadius, neckRadius, neckHeight, 24);
      const neckMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
      const neck = new THREE.Mesh(neckGeo, neckMat);
      neck.position.y = bottleHeight / 2 + neckHeight / 2;
      bottleGroup.add(neck);

      // Smart Cap with LED Ring
      const capRadius = bottleRadius * 0.58;
      const capHeight = h * 0.1;
      const capGeo = new THREE.CylinderGeometry(capRadius, capRadius, capHeight, 24);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = neck.position.y + neckHeight / 2 + capHeight / 2;
      bottleGroup.add(cap);

      // Glowing Emerald Ring on Cap
      const ringGeo = new THREE.TorusGeometry(capRadius * 1.02, 0.08, 16, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = cap.position.y;
      bottleGroup.add(ring);

      root.add(bottleGroup);
      productMeshRef.current = bottleGroup;
    } else {
      // General rectangular product
      const prodGeo = new THREE.BoxGeometry(l * 0.9, h * 0.9, w * 0.9);
      const prodMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.7,
        roughness: 0.3,
      });
      const prodMesh = new THREE.Mesh(prodGeo, prodMat);
      root.add(prodMesh);
      productMeshRef.current = prodMesh;
    }
  };

  const handleResetCamera = () => {
    if (cameraRef.current && packageGroupRef.current) {
      cameraRef.current.position.set(24, 20, 28);
      cameraRef.current.lookAt(0, 0, 0);
      packageGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const handleZoom = (delta: number) => {
    if (cameraRef.current) {
      const curDist = cameraRef.current.position.length();
      const newDist = Math.max(12, Math.min(70, curDist + delta));
      cameraRef.current.position.setLength(newDist);
    }
  };

  return (
    <div className={`relative rounded-2xl sleek-canvas-area border border-slate-200 overflow-hidden ${className}`}>
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Corner Metrics (from Sleek Interface design theme) */}
      {metrics && (
        <>
          {/* Top-Left: Carbon Impact */}
          <div className="sleek-metric-floating top-4 left-4 sm:top-5 sm:left-5 pointer-events-none">
            <div className="sleek-metric-label">Carbon Impact</div>
            <div className="sleek-metric-value emerald">
              {metrics.carbon_footprint !== undefined ? metrics.carbon_footprint.toFixed(2) : '0.92'} kg{' '}
              <span className="text-xs font-normal text-slate-500">CO₂e</span>
            </div>
          </div>

          {/* Top-Right: Est. Unit Cost */}
          <div className="sleek-metric-floating top-4 right-4 sm:top-5 sm:right-5 pointer-events-none">
            <div className="sleek-metric-label">Est. Unit Cost</div>
            <div className="sleek-metric-value">
              ₹{metrics.estimated_cost !== undefined ? metrics.estimated_cost.toFixed(2) : '16.40'}
            </div>
          </div>

          {/* Bottom-Right: Protection */}
          <div className="sleek-metric-floating bottom-14 right-4 sm:bottom-16 sm:right-5 hidden md:block pointer-events-none">
            <div className="sleek-metric-label">Protection</div>
            <div className="sleek-metric-value">
              {metrics.protection_score ?? 92}
              <span className="text-xs font-normal text-slate-500">/100</span>
            </div>
          </div>

          {/* Bottom-Left: Recyclability */}
          <div className="sleek-metric-floating bottom-14 left-4 sm:bottom-16 sm:left-5 hidden md:block pointer-events-none">
            <div className="sleek-metric-label">Recyclability</div>
            <div className="sleek-metric-value emerald">
              {metrics.recyclability ?? 91}%
            </div>
          </div>
        </>
      )}

      {/* Material & Dimension Tag */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-2 text-xs z-10">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: materialColor }} />
        <span className="font-semibold text-slate-900">{materialName}</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-600 font-mono">
          {length_mm} × {width_mm} × {height_mm} mm
        </span>
      </div>

      {/* 3D Viewport Controls Floating Toolbar */}
      <div className="absolute bottom-3.5 right-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            autoRotate ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Toggle Auto Rotation"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setExplodedState(!explodedState)}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            explodedState ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Toggle Exploded Assembly View"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(-4)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(4)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={handleResetCamera}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Reset Camera View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Helper Notice */}
      <div className="absolute bottom-3.5 left-4 text-[11px] text-slate-400 font-medium pointer-events-none hidden sm:block">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};
