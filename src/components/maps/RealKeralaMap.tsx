'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { KERALA_DISTRICTS, CURRENT_DISEASE_HOTSPOTS, KERALA_CENTER, KERALA_STATS } from '@/data/kerala-geography';

export default function RealKeralaMap() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(450, 450);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Create Kerala base shape (flattened sphere to represent the state)
    const keralaGeometry = new THREE.SphereGeometry(2.5, 64, 32);
    keralaGeometry.scale(1, 0.7, 1.2); // Flatten and shape like Kerala
    
    const keralaMaterial = new THREE.MeshLambertMaterial({
      color: 0x1a6b6b, // Kerala teal
      transparent: true,
      opacity: 0.85,
      wireframe: false
    });
    const kerala = new THREE.Mesh(keralaGeometry, keralaMaterial);
    kerala.castShadow = true;
    kerala.receiveShadow = true;
    scene.add(kerala);

    // Add district markers based on real coordinates
    const districtMeshes: { [key: string]: THREE.Mesh } = {};
    KERALA_DISTRICTS.forEach((district) => {
      // Convert lat/lng to 3D position on the Kerala surface
      const lat = (district.coordinates[1] - KERALA_CENTER[1]) * 25; // Scale factor
      const lng = (district.coordinates[0] - KERALA_CENTER[0]) * 25;
      
      const districtGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const riskColor = {
        low: 0x00ff00,
        medium: 0xffff00,
        high: 0xff8800,
        critical: 0xff0000
      }[district.currentDiseaseRisk];
      
      const districtMaterial = new THREE.MeshPhongMaterial({
        color: riskColor,
        transparent: true,
        opacity: 0.9,
        emissive: riskColor,
        emissiveIntensity: 0.3
      });
      
      const districtMesh = new THREE.Mesh(districtGeometry, districtMaterial);
      
      // Position on Kerala surface
      districtMesh.position.x = lng;
      districtMesh.position.y = lat;
      districtMesh.position.z = Math.sqrt(Math.max(0, 6.25 - lng*lng - lat*lat)) * 0.9;
      
      scene.add(districtMesh);
      districtMeshes[district.id] = districtMesh;
      
      // Add district label
      if (district.activeHealthAlerts > 10) {
        const labelGeometry = new THREE.RingGeometry(0.15, 0.2, 8);
        const labelMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xffffff, 
          transparent: true, 
          opacity: 0.8 
        });
        const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
        labelMesh.position.copy(districtMesh.position);
        labelMesh.position.z += 0.1;
        scene.add(labelMesh);
      }
    });

    // Add disease hotspots with real data
    const hotspotMeshes: { [key: string]: THREE.Mesh } = {};
    CURRENT_DISEASE_HOTSPOTS.forEach((hotspot) => {
      if (!hotspot.isActive) return;
      
      const lat = (hotspot.coordinates[1] - KERALA_CENTER[1]) * 25;
      const lng = (hotspot.coordinates[0] - KERALA_CENTER[0]) * 25;
      
      const hotspotGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
      const hotspotColor = {
        low: 0xff6b6b,
        medium: 0xff4757,
        high: 0xc44569,
        critical: 0xa55eea
      }[hotspot.riskLevel];
      
      const hotspotMaterial = new THREE.MeshPhongMaterial({
        color: hotspotColor,
        transparent: true,
        opacity: 0.8,
        emissive: hotspotColor,
        emissiveIntensity: 0.5
      });
      
      const hotspotMesh = new THREE.Mesh(hotspotGeometry, hotspotMaterial);
      
      hotspotMesh.position.x = lng;
      hotspotMesh.position.y = lat;
      hotspotMesh.position.z = Math.sqrt(Math.max(0, 6.25 - lng*lng - lat*lat)) * 1.2;
      
      scene.add(hotspotMesh);
      hotspotMeshes[hotspot.id] = hotspotMesh;
    });

    // Add ambient particle effects for health data flow
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 12;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Add wireframe for Kerala outline
    const wireframeGeometry = keralaGeometry.clone();
    const wireframeMaterial = new THREE.WireframeGeometry(wireframeGeometry);
    const wireframe = new THREE.LineSegments(wireframeMaterial, new THREE.LineBasicMaterial({ 
      color: 0x00ffff, 
      transparent: true, 
      opacity: 0.3 
    }));
    scene.add(wireframe);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 10, 8);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    
    const pointLight1 = new THREE.PointLight(0x00ffff, 0.5, 20);
    pointLight1.position.set(-5, 0, 5);
    
    const pointLight2 = new THREE.PointLight(0xff6b6b, 0.3, 15);
    pointLight2.position.set(5, 5, 3);
    
    scene.add(ambientLight);
    scene.add(directionalLight);
    scene.add(pointLight1);
    scene.add(pointLight2);

    // Camera position
    camera.position.set(0, 2, 7);
    camera.lookAt(0, 0, 0);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Gentle rotation of Kerala
      kerala.rotation.y += 0.004;
      wireframe.rotation.y += 0.004;
      
      // Pulse disease hotspots based on severity and affected count
      Object.entries(hotspotMeshes).forEach(([id, mesh]) => {
        const hotspot = CURRENT_DISEASE_HOTSPOTS.find(h => h.id === id);
        if (!hotspot) return;
        
        const pulseIntensity = {
          low: 0.2,
          medium: 0.4,
          high: 0.6,
          critical: 0.9
        }[hotspot.riskLevel];
        
        const affectedFactor = Math.min(hotspot.affectedCount / 100, 2);
        const scale = 1 + (pulseIntensity * affectedFactor * Math.sin(time * 4 + parseInt(id.slice(-1), 10) || 0));
        mesh.scale.setScalar(Math.max(0.5, scale));
        
        // Rotate hotspots
        mesh.rotation.y += 0.02;
      });
      
      // District health status indicators
      Object.entries(districtMeshes).forEach(([id, mesh]) => {
        const district = KERALA_DISTRICTS.find(d => d.id === id);
        if (!district) return;
        
        // High alert districts pulse faster
        if (district.activeHealthAlerts > 10) {
          const pulse = 1 + 0.2 * Math.sin(time * 6);
          mesh.scale.setScalar(pulse);
        } else if (district.activeHealthAlerts > 5) {
          const pulse = 1 + 0.1 * Math.sin(time * 3);
          mesh.scale.setScalar(pulse);
        }
      });
      
      // Animate particles (health data flow)
      particles.rotation.y += 0.002;
      particles.rotation.x += 0.001;
      const particlePositions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        particlePositions[i3 + 1] += Math.sin(time + i * 0.1) * 0.02;
        particlePositions[i3 + 2] += Math.cos(time + i * 0.05) * 0.01;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      
      // Animate lights
      pointLight1.intensity = 0.5 + 0.2 * Math.sin(time * 2);
      pointLight2.intensity = 0.3 + 0.2 * Math.sin(time * 3);
      
      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      
      // Check intersections with hotspots
      const hotspotArray = Object.values(hotspotMeshes);
      const intersects = raycaster.intersectObjects(hotspotArray);
      
      if (intersects.length > 0) {
        const hotspotId = Object.keys(hotspotMeshes).find(id => 
          hotspotMeshes[id] === intersects[0].object
        );
        setHoveredHotspot(hotspotId || null);
        document.body.style.cursor = 'pointer';
      } else {
        setHoveredHotspot(null);
        document.body.style.cursor = 'default';
      }
    };
    
    renderer.domElement.addEventListener('mousemove', onMouseMove);

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      document.body.style.cursor = 'default';
    };
  }, []);

  const hoveredHotspotData = hoveredHotspot ? 
    CURRENT_DISEASE_HOTSPOTS.find(h => h.id === hoveredHotspot) : null;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-kerala-teal/20 rounded-2xl overflow-hidden">
      <div ref={mountRef} className="relative" />
      
      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-kerala-teal border-t-transparent rounded-full"
          />
          <div className="absolute mt-24 text-white text-sm">Loading Kerala Health Map...</div>
        </div>
      )}
      
      {/* Hotspot Tooltip */}
      {hoveredHotspotData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl max-w-sm border border-gray-200"
        >
          <h4 className="font-bold text-base text-red-700 mb-2">
            🚨 {hoveredHotspotData.diseaseName}
          </h4>
          <p className="text-sm text-gray-700 mb-2">
            {hoveredHotspotData.description}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            <div>
              <span className="font-semibold text-gray-600">Affected:</span> {hoveredHotspotData.affectedCount}
            </div>
            <div>
              <span className="font-semibold text-gray-600">Reported:</span> {hoveredHotspotData.reportedDate}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs text-gray-600">Risk Level:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-white text-xs font-bold ${
                hoveredHotspotData.riskLevel === 'critical' ? 'bg-purple-600' :
                hoveredHotspotData.riskLevel === 'high' ? 'bg-red-500' :
                hoveredHotspotData.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
              }`}>
                {hoveredHotspotData.riskLevel.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
            <div className="font-semibold text-blue-800 mb-1">Prevention:</div>
            <ul className="text-blue-700 space-y-1">
              {hoveredHotspotData.preventionMeasures.slice(0, 2).map((measure, i) => (
                <li key={i}>• {measure}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
      
      {/* Enhanced Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg text-xs max-w-64 border border-gray-200">
        <div className="space-y-3">
          <div className="font-bold text-kerala-teal text-base mb-3 flex items-center">
            <div className="w-3 h-3 bg-kerala-teal rounded-full mr-2 animate-pulse"></div>
            Kerala Health Surveillance
          </div>
          
          {/* District Risk Levels */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">District Risk Levels:</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>Low ({KERALA_DISTRICTS.filter(d => d.currentDiseaseRisk === 'low').length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Medium ({KERALA_DISTRICTS.filter(d => d.currentDiseaseRisk === 'medium').length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <span>High ({KERALA_DISTRICTS.filter(d => d.currentDiseaseRisk === 'high').length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span>Critical ({KERALA_DISTRICTS.filter(d => d.currentDiseaseRisk === 'critical').length})</span>
              </div>
            </div>
          </div>
          
          {/* Active Hotspots */}
          <div className="border-t border-gray-200 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce"></div>
                <span className="font-medium">Active Outbreaks</span>
              </div>
              <span className="font-bold text-red-600">{CURRENT_DISEASE_HOTSPOTS.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
              <span>Real-time Health Data</span>
            </div>
          </div>
          
          {/* Live Stats */}
          <div className="border-t border-gray-200 pt-3 text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Migrant Workers:</span>
              <span className="font-semibold text-kerala-teal">{KERALA_STATS.totalMigrantWorkers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Health Facilities:</span>
              <span className="font-semibold text-kerala-teal">{KERALA_STATS.totalHealthFacilities}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Alerts:</span>
              <span className="font-semibold text-red-600">{KERALA_STATS.activeHealthAlerts}</span>
            </div>
            <div className="flex justify-between">
              <span>Districts:</span>
              <span className="font-semibold text-kerala-teal">{KERALA_STATS.totalDistricts}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Real-time Updates Indicator */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-full text-sm shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-medium">Live Data</span>
        </div>
      </div>

      {/* Data Source Attribution */}
      <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs">
        <div className="flex items-center space-x-2">
          <span>🗺️</span>
          <span>Real Kerala Geographic Data</span>
        </div>
      </div>
    </div>
  );
}