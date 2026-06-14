"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./HeroGraph.css";

export function HeroGraph() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, host.clientWidth / host.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const group = new THREE.Group();
    const nodes: THREE.Mesh[] = [];
    let frame = 0;

    camera.position.set(0, 0, 150);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight("#ffffff", 0.85));
    const light = new THREE.DirectionalLight("#ffffff", 1.35);
    light.position.set(20, 40, 90);
    scene.add(light);

    for (let i = 0; i < 28; i += 1) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(i % 5 === 0 ? 3.7 : 2.5, 18, 14),
        new THREE.MeshStandardMaterial({ color: i % 5 === 0 ? "#3867ff" : "#0f9f8f", metalness: 0.28, roughness: 0.35 })
      );
      mesh.position.set((i % 7) * 18 - 54, Math.floor(i / 7) * 16 - 26, Math.sin(i) * 18);
      nodes.push(mesh);
      group.add(mesh);
    }

    const material = new THREE.LineBasicMaterial({ color: "#9fb5d1", transparent: true, opacity: 0.55 });
    for (let i = 1; i < nodes.length; i += 1) {
      const from = nodes[Math.max(0, i - 1 - (i % 3))].position;
      const to = nodes[i].position;
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([from, to]), material));
    }

    scene.add(group);

    const resize = () => {
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    const animate = () => {
      group.rotation.y += 0.0025;
      group.rotation.x = Math.sin(Date.now() / 2500) * 0.08;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      nodes.forEach((mesh) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) mesh.material.forEach((item) => item.dispose());
        else mesh.material.dispose();
      });
      material.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="hero-graph" ref={hostRef} aria-label="Animated Three.js workflow preview" />;
}
