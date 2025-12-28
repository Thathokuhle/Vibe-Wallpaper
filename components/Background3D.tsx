import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Background3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    // Deep amethyst/dark cavern background color
    const bgColor = new THREE.Color('#150520'); 
    scene.background = bgColor;
    // Purple fog for depth
    scene.fog = new THREE.FogExp2(bgColor.getHex(), 0.025);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    const container = containerRef.current;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    // Deep purple ambient light
    const ambientLight = new THREE.AmbientLight('#2d1b4e', 1.2); 
    scene.add(ambientLight);

    // Soft lavender main light
    const pointLight = new THREE.PointLight('#e6e6fa', 1.5, 50); 
    pointLight.position.set(0, 10, 5);
    scene.add(pointLight);

    // Subtle cool accent light (Silver/Cyan tint)
    const accentLight = new THREE.PointLight('#c0c0c0', 0.8, 40);
    accentLight.position.set(15, 5, -10);
    scene.add(accentLight);

    // --- Materials ---
    // Amethyst Crystal Material
    const crystalMaterial = new THREE.MeshPhysicalMaterial({
      color: '#9966cc', // Amethyst purple
      emissive: '#4b0082', // Indigo glow
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.1, // Shiny
      transmission: 0.3, // Semi-transparent
      thickness: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    // Dark Reflective Water Material
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: '#0a0410', // Very dark purple/black
      roughness: 0.02,
      metalness: 0.95,
    });

    // --- Geometry ---
    // Geodesic-ish shapes (Icosahedron)
    const crystalGeo = new THREE.IcosahedronGeometry(1, 0);
    const count = 300;
    
    // Ceiling/Wall Crystals
    const crystals = new THREE.InstancedMesh(crystalGeo, crystalMaterial, count);
    const dummy = new THREE.Object3D();
    const positions: {x: number, y: number, z: number}[] = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 90;
      const z = (Math.random() - 0.5) * 70 - 15;
      // Arching ceiling structure
      const y = 12 + Math.random() * 8 - (Math.abs(x) * 0.15) - (Math.abs(z) * 0.1); 

      dummy.position.set(x, y, z);
      dummy.rotation.set(
        Math.random() * Math.PI, 
        Math.random() * Math.PI, 
        Math.random() * Math.PI
      );
      
      // Elongated crystal shards
      const s = Math.random() * 0.6 + 0.4;
      dummy.scale.set(s, s * (1 + Math.random() * 2.5), s);
      
      dummy.updateMatrix();
      crystals.setMatrixAt(i, dummy.matrix);
      positions.push({x, y, z});
    }
    scene.add(crystals);

    // Reflected Crystals (Under water)
    const reflectedCrystals = new THREE.InstancedMesh(crystalGeo, crystalMaterial.clone(), count);
    // Slightly dimmer and more opaque for reflection illusion
    (reflectedCrystals.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.2;
    
    const waterLevel = -2;

    for (let i = 0; i < count; i++) {
      const {x, y, z} = positions[i];
      // Reflection math: newY = waterLevel - (y - waterLevel)
      const refY = waterLevel - (y - waterLevel);

      dummy.position.set(x, refY, z);
      dummy.rotation.set(
        Math.random() * Math.PI, 
        Math.random() * Math.PI, 
        Math.random() * Math.PI
      );
      const s = Math.random() * 0.6 + 0.4;
      dummy.scale.set(s, s * (1 + Math.random() * 2.5), s);

      dummy.updateMatrix();
      reflectedCrystals.setMatrixAt(i, dummy.matrix);
    }
    scene.add(reflectedCrystals);

    // Water Plane
    const waterPlane = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), waterMaterial);
    waterPlane.rotation.x = -Math.PI / 2;
    waterPlane.position.y = waterLevel;
    scene.add(waterPlane);

    // --- Animation Loop ---
    let time = 0;
    
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.003; // Slow, serene speed

      // Pulse light (Oasis breathing)
      pointLight.intensity = 1.5 + Math.sin(time * 2) * 0.4;
      (crystals.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.5 + Math.sin(time * 1.5) * 0.3;

      // Camera bob
      camera.position.y = 2 + Math.sin(time * 0.5) * 0.3;
      camera.rotation.x = Math.sin(time * 0.25) * 0.02;

      // Gentle crystal float
      crystals.rotation.y = Math.sin(time * 0.05) * 0.02;
      reflectedCrystals.rotation.y = Math.sin(time * 0.05) * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // --- Resize ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" />;
};