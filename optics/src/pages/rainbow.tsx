import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

const Rainbow: React.FC = () => {
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let camera: THREE.PerspectiveCamera;
    let scene: THREE.Scene;
    let renderer: THREE.WebGLRenderer;
    let sky: Sky;
    let sun: THREE.Vector3;
    let rainbow: THREE.Mesh;
    let mountElement: HTMLDivElement | null;

    const init = () => {
      // Camera
      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        100,
        2000000
      );
      camera.position.set(0, 65, 2000);

      // Scene
      scene = new THREE.Scene();

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(10000, 10000),
        new THREE.MeshBasicMaterial({ color: "green", side: THREE.DoubleSide })
      );
      ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
      ground.position.y = 0;
      scene.add(ground);

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.5;
      mountElement = mountRef.current;
      mountElement?.appendChild(renderer.domElement);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableRotate = false;

      initSky();
      initRainbow();

      window.addEventListener("resize", onWindowResize);

      animate();
    };

    const initSky = () => {
      // Add Sky
      sky = new Sky();
      sky.scale.setScalar(100000);
      scene.add(sky);

      sun = new THREE.Vector3();

      // GUI Controller
      const effectController = {
        elevation: 0,
      };

      const guiChanged = () => {
        const uniforms = (sky.material as THREE.ShaderMaterial).uniforms;
        const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
        const theta = THREE.MathUtils.degToRad(180);

        sun.setFromSphericalCoords(1, phi, theta);
        uniforms["sunPosition"].value.copy(sun);

        // Update rainbow orientation when sun angle changes
        updateRainbowOrientation();
      };

      const gui = new GUI();
      gui.add(effectController, "elevation", 0, 90, 0.1).onChange(guiChanged);
      guiChanged();
    };

    const initRainbow = () => {
      // Primary rainbow (smaller, brighter)
      const primaryInnerRadius = 400;
      const primaryOuterRadius = 450;
      const segments = 64;
      const primaryGeometry = new THREE.RingGeometry(
        primaryInnerRadius,
        primaryOuterRadius,
        segments
      );

      const primaryCanvas = document.createElement("canvas");
      primaryCanvas.width = 512;
      primaryCanvas.height = 512;
      const primaryCtx = primaryCanvas.getContext("2d")!;

      const primaryGradient = primaryCtx.createRadialGradient(
        primaryCanvas.width / 2,
        primaryCanvas.height / 2,
        primaryCanvas.width / 2 - 50,
        primaryCanvas.width / 2,
        primaryCanvas.height / 2,
        primaryCanvas.width / 2
      );

      primaryGradient.addColorStop(0.0, "#ff0000"); // red
      primaryGradient.addColorStop(0.17, "#ff7f00"); // orange
      primaryGradient.addColorStop(0.33, "#ffff00"); // yellow
      primaryGradient.addColorStop(0.5, "#00ff00"); // green
      primaryGradient.addColorStop(0.67, "#0000ff"); // blue
      primaryGradient.addColorStop(0.83, "#4b0082"); // indigo
      primaryGradient.addColorStop(1.0, "#8f00ff"); // violet

      primaryCtx.fillStyle = primaryGradient;
      primaryCtx.fillRect(0, 0, primaryCanvas.width, primaryCanvas.height);

      const primaryTexture = new THREE.CanvasTexture(primaryCanvas);
      primaryTexture.wrapS = THREE.ClampToEdgeWrapping;
      primaryTexture.wrapT = THREE.ClampToEdgeWrapping;

      const primaryMaterial = new THREE.MeshBasicMaterial({
        map: primaryTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });

      rainbow = new THREE.Mesh(primaryGeometry, primaryMaterial);
      rainbow.position.set(0, 0, 0);
      scene.add(rainbow);

      // Secondary rainbow (larger, dimmer, reversed colors)
      const secondaryInnerRadius = 600;
      const secondaryOuterRadius = 700;
      const secondaryGeometry = new THREE.RingGeometry(
        secondaryInnerRadius,
        secondaryOuterRadius,
        segments
      );

      const secondaryCanvas = document.createElement("canvas");
      secondaryCanvas.width = 512;
      secondaryCanvas.height = 512;
      const secondaryCtx = secondaryCanvas.getContext("2d")!;

      const secondaryGradient = secondaryCtx.createRadialGradient(
        secondaryCanvas.width / 2,
        secondaryCanvas.height / 2,
        secondaryCanvas.width / 2 - 50,
        secondaryCanvas.width / 2,
        secondaryCanvas.height / 2,
        secondaryCanvas.width / 2
      );

      // Secondary rainbow has reversed colors and is dimmer
      secondaryGradient.addColorStop(0.0, "#8f00ff"); // violet
      secondaryGradient.addColorStop(0.17, "#4b0082"); // indigo
      secondaryGradient.addColorStop(0.33, "#0000ff"); // blue
      secondaryGradient.addColorStop(0.5, "#00ff00"); // green
      secondaryGradient.addColorStop(0.67, "#ffff00"); // yellow
      secondaryGradient.addColorStop(0.83, "#ff7f00"); // orange
      secondaryGradient.addColorStop(1.0, "#ff0000"); // red

      secondaryCtx.fillStyle = secondaryGradient;
      secondaryCtx.fillRect(
        0,
        0,
        secondaryCanvas.width,
        secondaryCanvas.height
      );

      const secondaryTexture = new THREE.CanvasTexture(secondaryCanvas);
      secondaryTexture.wrapS = THREE.ClampToEdgeWrapping;
      secondaryTexture.wrapT = THREE.ClampToEdgeWrapping;

      const secondaryMaterial = new THREE.MeshBasicMaterial({
        map: secondaryTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4, // Dimmer than primary
      });

      const secondaryRainbow = new THREE.Mesh(
        secondaryGeometry,
        secondaryMaterial
      );
      secondaryRainbow.position.set(0, 0, 0);
      scene.add(secondaryRainbow);
    };

    const updateRainbowOrientation = () => {
      if (!rainbow || !sun) return;

      // Update primary rainbow orientation
      rainbow.lookAt(sun);

      // Update secondary rainbow orientation (find it in the scene)
      scene.children.forEach((child) => {
        if (
          child instanceof THREE.Mesh &&
          child !== rainbow &&
          child.geometry instanceof THREE.RingGeometry
        ) {
          child.lookAt(sun);
        }
      });
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    init();

    return () => {
      window.removeEventListener("resize", onWindowResize);
      mountElement?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default Rainbow;
