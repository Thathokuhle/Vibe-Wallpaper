import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Background3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const bgColor = new THREE.Color('#04131c');
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(bgColor.getHex(), 0.028);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      300
    );
    camera.position.set(0, 10, 28);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight('#4d9db2', 0.35);
    scene.add(ambient);

    const sunLight = new THREE.DirectionalLight('#3aa9c4', 1.55);
    sunLight.position.set(-10, 20, 10);
    scene.add(sunLight);

    const coolLight = new THREE.PointLight('#c6f4ff', 0.75, 80);
    coolLight.position.set(12, 8, -15);
    scene.add(coolLight);

    // Sun disc + glow
    const sunDisc = new THREE.Mesh(
      new THREE.CircleGeometry(4.2, 64),
      new THREE.MeshBasicMaterial({ color: '#b9f0ff' })
    );
    sunDisc.position.set(-12, 12, -30);
    scene.add(sunDisc);

    const sunGlow = new THREE.Mesh(
      new THREE.CircleGeometry(7.6, 64),
      new THREE.MeshBasicMaterial({
        color: '#7edfee',
        transparent: true,
        opacity: 0.35,
      })
    );
    sunGlow.position.copy(sunDisc.position);
    scene.add(sunGlow);

    // Dunes
    const duneGeometry = new THREE.PlaneGeometry(220, 220, 120, 120);
    duneGeometry.rotateX(-Math.PI / 2);
    const duneMaterial = new THREE.MeshStandardMaterial({
      color: '#17333c',
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true,
    });
    const dunes = new THREE.Mesh(duneGeometry, duneMaterial);
    dunes.position.y = -2.5;
    scene.add(dunes);

    const position = duneGeometry.attributes.position as THREE.BufferAttribute;
    const basePositions = (position.array as Float32Array).slice();

    // Floating rings
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: '#39b5cf',
      emissive: '#1b6e83',
      emissiveIntensity: 0.8,
      roughness: 0.18,
      metalness: 0.7,
      transparent: true,
      opacity: 0.75,
    });

    const ringOne = new THREE.Mesh(
      new THREE.TorusGeometry(6.2, 0.18, 16, 120),
      ringMaterial
    );
    ringOne.position.set(10, 5, -12);
    ringOne.rotation.set(Math.PI / 3, 0.2, Math.PI / 6);
    scene.add(ringOne);

    const ringTwo = new THREE.Mesh(
      new THREE.TorusGeometry(4.6, 0.14, 16, 120),
      ringMaterial
    );
    ringTwo.position.set(6, 7.5, -6);
    ringTwo.rotation.set(Math.PI / 2.6, -0.3, Math.PI / 3);
    scene.add(ringTwo);

    const ringThree = new THREE.Mesh(
      new THREE.TorusGeometry(8.8, 0.2, 16, 140),
      ringMaterial
    );
    ringThree.position.set(-4, 4, -18);
    ringThree.rotation.set(Math.PI / 2.2, 0.1, -Math.PI / 5);
    scene.add(ringThree);

    // Dust particles
    const dustCount = 900;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i += 1) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 180;
      dustPositions[i * 3 + 1] = Math.random() * 18 + 2;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      color: '#d3f6ff',
      size: 0.45,
      transparent: true,
      opacity: 0.5,
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

    let time = 0;
    let frameCount = 0;

    const animate = () => {
      time += 0.006;
      frameCount += 1;

      for (let i = 0; i < position.count; i += 1) {
        const ix = i * 3;
        const x = basePositions[ix];
        const z = basePositions[ix + 2];
        const ridge = Math.sin(x * 0.06 + time * 0.9) * 1.15;
        const trough = Math.cos(z * 0.04 + time * 0.7) * 0.95;
        position.array[ix + 1] = ridge + trough;
      }
      position.needsUpdate = true;
      if (frameCount % 2 === 0) {
        duneGeometry.computeVertexNormals();
      }

      ringOne.rotation.z += 0.0015;
      ringTwo.rotation.y -= 0.0012;
      ringThree.rotation.x += 0.001;

      dust.rotation.y += 0.0008;
      dust.position.y = 1.5 + Math.sin(time * 0.6) * 0.25;

      sunDisc.lookAt(camera.position);
      sunGlow.lookAt(camera.position);

      camera.position.y = 9.6 + Math.sin(time * 0.4) * 0.35;
      camera.position.x = Math.sin(time * 0.2) * 0.3;
      camera.lookAt(0, 0, -10);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
        if (object instanceof THREE.Points) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
};
