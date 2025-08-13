"use client";

import React, { useRef, useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { NavbarLogo } from "@/components/ui/resizable-navbar";
import * as THREE from "three";

export default function Rainbow() {
  const { setTheme } = useTheme();
  setTheme("dark");

  // no scrollbar
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  const mountRef = useRef<HTMLDivElement>(null);
  const [rainbowPosition, setRainbowPosition] = useState({ x: 0, y: 0, z: 5 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000033);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create sun (sphere with glow)
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      emissive: 0xffaa00,
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 3, 0);
    sun.castShadow = true;
    scene.add(sun);

    // Sun glow effect
    const glowGeometry = new THREE.SphereGeometry(2.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.3,
    });
    const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    sunGlow.position.set(0, 3, 0);
    scene.add(sunGlow);

    // Create rainbow (torus with rainbow material)
    const rainbowGeometry = new THREE.TorusGeometry(4, 0.3, 16, 100, Math.PI);
    const rainbowMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
    });
    const rainbow = new THREE.Mesh(rainbowGeometry, rainbowMaterial);
    rainbow.position.set(
      rainbowPosition.x,
      rainbowPosition.y,
      rainbowPosition.z
    );
    rainbow.rotation.x = Math.PI / 2; // Rotate to be perpendicular to sun
    rainbow.castShadow = true;
    scene.add(rainbow);

    // Create rainbow colors using multiple torus segments
    const rainbowColors = [
      0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3,
    ];

    rainbowColors.forEach((color, index) => {
      const segmentGeometry = new THREE.TorusGeometry(
        4 - index * 0.2,
        0.15,
        16,
        100,
        Math.PI
      );
      const segmentMaterial = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.9,
        shininess: 100,
      });
      const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
      segment.position.set(
        rainbowPosition.x,
        rainbowPosition.y,
        rainbowPosition.z
      );
      segment.rotation.x = Math.PI / 2;
      segment.castShadow = true;
      scene.add(segment);
    });

    // Add some clouds
    for (let i = 0; i < 5; i++) {
      const cloudGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const cloudMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
      });
      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloud.position.set(Math.sin(i * 1.5) * 8, -1, Math.cos(i * 1.5) * 8);
      scene.add(cloud);
    }

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    ground.receiveShadow = true;
    scene.add(ground);

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(rainbow);

      if (intersects.length > 0) {
        setIsDragging(true);
        setDragOffset({
          x: event.clientX - rainbowPosition.x * 100,
          y: event.clientY - rainbowPosition.y * 100,
        });
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;

      const newX = (event.clientX - dragOffset.x) / 100;
      const newY = (event.clientY - dragOffset.y) / 100;

      setRainbowPosition({ x: newX, y: newY, z: rainbowPosition.z });

      // Update rainbow position
      rainbow.position.set(newX, newY, rainbowPosition.z);

      // Update all rainbow segments
      scene.children.forEach((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.geometry instanceof THREE.TorusGeometry
        ) {
          child.position.set(newX, newY, rainbowPosition.z);
        }
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    // Event listeners
    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseup", onMouseUp);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate sun slowly
      sun.rotation.y += 0.005;
      sunGlow.rotation.y += 0.005;

      // Animate clouds
      scene.children.forEach((child, index) => {
        if (
          child instanceof THREE.Mesh &&
          child.geometry instanceof THREE.SphereGeometry &&
          index > 0
        ) {
          child.position.x += Math.sin(Date.now() * 0.001 + index) * 0.01;
          child.position.z += Math.cos(Date.now() * 0.001 + index) * 0.01;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseup", onMouseUp);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [rainbowPosition, isDragging, dragOffset]);

  return (
    <div className="w-full h-screen bg-black">
      <div className="absolute top-4 left-4 z-10">
        <NavbarLogo />
      </div>

      <div ref={mountRef} className="w-full h-full" />

      <div className="absolute top-4 right-4 text-white text-sm bg-black bg-opacity-50 p-3 rounded">
        <div>Rainbow Position:</div>
        <div>X: {rainbowPosition.x.toFixed(2)}</div>
        <div>Y: {rainbowPosition.y.toFixed(2)}</div>
        <div>Z: {rainbowPosition.z.toFixed(2)}</div>
        <div className="mt-2 text-xs">
          Click and drag the rainbow to move it
        </div>
      </div>
    </div>
  );
}
