"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

export type Brand = "github" | "linkedin" | "x";

type Props = {
  brand: Brand;
  size?: number;
  onClick?: () => void;
};

const BRAND_SVGS: Record<Brand, string> = {
  github: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
};

const BRAND_COLORS: Record<Brand, number> = {
  github: 0x1f1f1f,
  linkedin: 0x0a66c2,
  x: 0x0a0a0a,
};

const RIM_COLORS: Record<Brand, number> = {
  github: 0xa0a0a0,
  linkedin: 0xa6cdfb,
  x: 0xb0b0b0,
};

export default function BrandIcon3D({ brand, size = 56, onClick }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const hoverRef = useRef(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 42);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const loader = new SVGLoader();
    const data = loader.parse(BRAND_SVGS[brand]);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 1.6,
      bevelEnabled: true,
      bevelThickness: 0.18,
      bevelSize: 0.18,
      bevelSegments: 4,
      curveSegments: 24,
    };

    const material = new THREE.MeshPhysicalMaterial({
      color: BRAND_COLORS[brand],
      metalness: 0.4,
      roughness: 0.28,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
      reflectivity: 0.65,
    });

    const group = new THREE.Group();

    data.paths.forEach((path) => {
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach((shape) => {
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      });
    });

    // SVG y-axis is flipped relative to THREE.
    group.scale.y = -1;

    // Center geometry.
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    const sizeVec = box.getSize(new THREE.Vector3());
    group.position.sub(center);

    const wrapper = new THREE.Group();
    wrapper.add(group);
    scene.add(wrapper);

    const maxDim = Math.max(sizeVec.x, sizeVec.y);
    const fit = 18 / maxDim;
    wrapper.scale.setScalar(fit);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(5, 7, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(RIM_COLORS[brand], 0.85);
    rim.position.set(-6, -3, 4);
    scene.add(rim);
    const fill = new THREE.PointLight(0xfff1c8, 0.5, 60);
    fill.position.set(-4, 4, 6);
    scene.add(fill);

    let raf = 0;
    let t = 0;
    const baseScale = fit;
    const animate = () => {
      t += 0.012;
      const targetY = hoverRef.current ? t * 2.0 : Math.sin(t * 0.6) * 0.4;
      const targetX = hoverRef.current
        ? Math.sin(t * 1.4) * 0.2
        : Math.sin(t * 0.4) * 0.15;
      wrapper.rotation.y += (targetY - wrapper.rotation.y) * 0.1;
      wrapper.rotation.x += (targetX - wrapper.rotation.x) * 0.1;
      const targetScale = hoverRef.current ? baseScale * 1.08 : baseScale;
      const cs = wrapper.scale.x;
      const next = cs + (targetScale - cs) * 0.12;
      wrapper.scale.setScalar(next);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material))
            obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });
    };
  }, [brand, size]);

  return (
    <div
      ref={mountRef}
      onClick={onClick}
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
      style={{
        width: size,
        height: size,
        cursor: onClick ? "pointer" : "default",
        display: "inline-block",
      }}
      aria-label={brand}
      role={onClick ? "button" : undefined}
    />
  );
}
