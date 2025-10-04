'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import type { DiseaseHotspot } from '@/types';

interface KeralaGlobeProps {
  hotspots?: DiseaseHotspot[];
  interactive?: boolean;
  autoRotate?: boolean;
}

const KeralaGlobe: React.FC<KeralaGlobeProps> = ({
  hotspots = [],
  interactive = true,
  autoRotate = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<DiseaseHotspot | null>(null);

  // Kerala districts with approximate coordinates
  const keralaDistricts = [
    { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, cases: 0 },
    { name: 'Kollam', lat: 8.8932, lng: 76.6141, cases: 0 },
    { name: 'Pathanamthitta', lat: 9.2648, lng: 76.7870, cases: 0 },
    { name: 'Alappuzha', lat: 9.4981, lng: 76.3388, cases: 0 },
    { name: 'Kottayam', lat: 9.5916, lng: 76.5222, cases: 0 },
    { name: 'Idukki', lat: 9.8518, lng: 76.9736, cases: 0 },
    { name: 'Ernakulam', lat: 9.9312, lng: 76.2673, cases: 0 },
    { name: 'Thrissur', lat: 10.5276, lng: 76.2144, cases: 0 },
    { name: 'Palakkad', lat: 10.7867, lng: 76.6548, cases: 0 },
    { name: 'Malappuram', lat: 11.0410, lng: 76.0870, cases: 0 },
    { name: 'Kozhikode', lat: 11.2588, lng: 75.7804, cases: 0 },
    { name: 'Wayanad', lat: 11.6054, lng: 76.0870, cases: 0 },
    { name: 'Kannur', lat: 11.8745, lng: 75.3704, cases: 0 },
    { name: 'Kasaragod', lat: 12.4996, lng: 74.9869, cases: 0 }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001122);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Create Kerala-shaped geometry (simplified)
    const keralaShape = createKeralaShape();
    const keralaGeometry = new THREE.ExtrudeGeometry(keralaShape, {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.05,
      bevelSegments: 8
    });

    // Kerala material with health theme
    const keralaMaterial = new THREE.MeshLambertMaterial({
      color: 0x008B8B,
      transparent: true,
      opacity: 0.8,
      emissive: 0x002222
    });

    const keralaMesh = new THREE.Mesh(keralaGeometry, keralaMaterial);
    keralaMesh.position.set(0, 0, 0);
    keralaMesh.castShadow = true;
    keralaMesh.receiveShadow = true;
    scene.add(keralaMesh);

    // Add wireframe overlay
    const wireframeGeometry = keralaGeometry.clone();
    const wireframeMaterial = new THREE.WireframeGeometry(wireframeGeometry);
    const wireframe = new THREE.LineSegments(wireframeMaterial, 
      new THREE.LineBasicMaterial({ color: 0x00BFFF, opacity: 0.3, transparent: true })
    );
    scene.add(wireframe);

    // Add district markers
    const districtMarkers = createDistrictMarkers();
    districtMarkers.forEach(marker => scene.add(marker));

    // Add hotspot indicators
    const hotspotIndicators = createHotspotIndicators(hotspots);
    hotspotIndicators.forEach(indicator => scene.add(indicator));

    // Lighting setup
    setupLighting(scene);

    // Particle background (stars)
    const particleSystem = createParticleSystem();
    scene.add(particleSystem);

    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !rendererRef.current) return;

      animationFrameRef.current = requestAnimationFrame(animate);

      // Auto-rotate
      if (autoRotate) {
        keralaMesh.rotation.y += 0.005;
        wireframe.rotation.y += 0.005;
      }

      // Animate hotspot indicators
      scene.children.forEach(child => {
        if (child.userData.isHotspot) {
          child.rotation.y += 0.02;
          // Pulsing effect for critical hotspots
          if (child.userData.severity === 'critical') {
            const scale = 1 + Math.sin(Date.now() * 0.01) * 0.2;
            child.scale.setScalar(scale);
          }
        }
      });

      // Animate particles
      const particles = scene.getObjectByName('particles');
      if (particles) {
        particles.rotation.x += 0.0005;
        particles.rotation.y += 0.001;
      }

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;

      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [hotspots, autoRotate]);

  const createKeralaShape = (): THREE.Shape => {
    const shape = new THREE.Shape();
    
    // Simplified Kerala outline (scaled to fit in view)
    const points = [
      [0, 4], [1, 3.8], [2, 3.5], [3, 3.2], [3.5, 2.8], 
      [3.8, 2.4], [4, 2], [4.2, 1.5], [4, 1], [3.8, 0.5],
      [3.5, 0], [3, -0.5], [2.5, -1], [2, -1.5], [1.5, -2],
      [1, -2.5], [0.5, -3], [0, -3.2], [-0.5, -3], [-1, -2.8],
      [-1.5, -2.5], [-2, -2], [-2.2, -1.5], [-2, -1], [-1.8, -0.5],
      [-1.5, 0], [-1, 0.5], [-0.5, 1], [0, 1.5], [0.2, 2],
      [0.1, 2.5], [0, 3], [-0.2, 3.5], [0, 4]
    ];

    shape.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(point => {
      shape.lineTo(point[0], point[1]);
    });

    return shape;
  };

  const createDistrictMarkers = (): THREE.Object3D[] => {
    const markers: THREE.Object3D[] = [];

    keralaDistricts.forEach(district => {
      // Convert lat/lng to 3D coordinates (simplified projection)
      const x = (district.lng - 76) * 0.5;
      const y = (district.lat - 10) * 0.5;
      const z = 0.3;

      // Create marker geometry
      const markerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const markerMaterial = new THREE.MeshLambertMaterial({
        color: 0x32CD32,
        emissive: 0x004400
      });

      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x, y, z);
      marker.userData = {
        district: district.name,
        isMarker: true
      };

      markers.push(marker);
    });

    return markers;
  };

  const createHotspotIndicators = (hotspots: DiseaseHotspot[]): THREE.Object3D[] => {
    const indicators: THREE.Object3D[] = [];

    hotspots.forEach(hotspot => {
      // Convert location to 3D coordinates
      const x = (hotspot.location.coordinates.lng - 76) * 0.5;
      const y = (hotspot.location.coordinates.lat - 10) * 0.5;
      const z = 0.4;

      // Color based on risk level
      let color = 0x32CD32; // low - green
      if (hotspot.risk_level === 'medium') color = 0xFF8C00; // orange
      if (hotspot.risk_level === 'high') color = 0xFF4500; // red
      if (hotspot.risk_level === 'critical') color = 0xFF0000; // bright red

      // Create hotspot geometry (ring)
      const ringGeometry = new THREE.RingGeometry(0.1, 0.2, 16);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });

      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.set(x, y, z);
      ring.userData = {
        hotspot,
        isHotspot: true,
        severity: hotspot.risk_level
      };

      indicators.push(ring);

      // Add glowing effect for high-risk areas
      if (hotspot.risk_level === 'high' || hotspot.risk_level === 'critical') {
        const glowGeometry = new THREE.RingGeometry(0.15, 0.25, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide
        });

        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(x, y, z + 0.01);
        glow.userData = { isGlow: true };
        
        indicators.push(glow);
      }
    });

    return indicators;
  };

  const setupLighting = (scene: THREE.Scene) => {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Accent light
    const accentLight = new THREE.PointLight(0x00BFFF, 0.3, 100);
    accentLight.position.set(-10, 0, 10);
    scene.add(accentLight);

    // Health-themed accent light
    const healthLight = new THREE.PointLight(0x32CD32, 0.2, 100);
    healthLight.position.set(0, -10, 5);
    scene.add(healthLight);
  };

  const createParticleSystem = (): THREE.Points => {
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;     // x
      positions[i + 1] = (Math.random() - 0.5) * 50; // y  
      positions[i + 2] = (Math.random() - 0.5) * 50; // z
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.3
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.name = 'particles';
    
    return particles;
  };

  return (
    <div className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-kerala-teal bg-opacity-20 rounded-2xl">
          <div className="text-white">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading Kerala Health Map...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mountRef} 
        className="w-full h-full rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ minHeight: '400px' }}
      />

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <h4 className="font-semibold mb-3 text-sm">Disease Risk Levels</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-health-green"></div>
            <span>Low Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-warning-orange"></div>
            <span>Medium Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-error-red"></div>
            <span>High Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></div>
            <span>Critical</span>
          </div>
        </div>
      </div>

      {/* Statistics Overlay */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <h4 className="font-semibold mb-3 text-sm">Live Statistics</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Total Cases:</span>
            <span className="font-bold">{hotspots.reduce((sum, h) => sum + h.cases_count, 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Hotspots:</span>
            <span className="font-bold">{hotspots.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Critical Areas:</span>
            <span className="font-bold text-error-red">
              {hotspots.filter(h => h.risk_level === 'critical').length}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white"
          onClick={() => {
            // Toggle auto-rotate (would need state management)
            console.log('Toggle auto-rotate');
          }}
        >
          <svg className="w-5 h-5 text-kerala-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white"
          onClick={() => {
            // Reset camera position
            console.log('Reset camera');
          }}
        >
          <svg className="w-5 h-5 text-kerala-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </motion.button>
      </div>

      {/* Selected Hotspot Info */}
      {selectedHotspot && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 shadow-2xl max-w-sm"
        >
          <h3 className="font-bold mb-4">Health Alert: {selectedHotspot.location.district}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Cases:</span>
              <span className="font-bold">{selectedHotspot.cases_count}</span>
            </div>
            <div className="flex justify-between">
              <span>Risk Level:</span>
              <span className={`font-bold ${
                selectedHotspot.risk_level === 'critical' ? 'text-red-600' :
                selectedHotspot.risk_level === 'high' ? 'text-error-red' :
                selectedHotspot.risk_level === 'medium' ? 'text-warning-orange' :
                'text-health-green'
              }`}>
                {selectedHotspot.risk_level.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="font-medium">Common Symptoms:</span>
              <p className="text-gray-600">{selectedHotspot.primary_symptoms.join(', ')}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedHotspot(null)}
            className="mt-4 w-full bg-kerala-teal text-white py-2 rounded-lg hover:bg-opacity-90 transition-opacity"
          >
            Close
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default KeralaGlobe;