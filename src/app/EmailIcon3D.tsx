"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  size?: number;
  onClick?: () => void;
};

// Build a rounded-rectangle outline (ring) Shape using a hole.
function makeRoundedRectRingShape(
  w: number,
  h: number,
  radius: number,
  strokeWidth: number
): THREE.Shape {
  const r = Math.min(radius, w / 2, h / 2);
  const outer = new THREE.Shape();
  outer.moveTo(-w / 2 + r, -h / 2);
  outer.lineTo(w / 2 - r, -h / 2);
  outer.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  outer.lineTo(w / 2, h / 2 - r);
  outer.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  outer.lineTo(-w / 2 + r, h / 2);
  outer.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  outer.lineTo(-w / 2, -h / 2 + r);
  outer.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

  const iw = w - strokeWidth * 2;
  const ih = h - strokeWidth * 2;
  const ir = Math.max(0, r - strokeWidth);
  const hole = new THREE.Path();
  hole.moveTo(-iw / 2 + ir, -ih / 2);
  hole.lineTo(iw / 2 - ir, -ih / 2);
  hole.quadraticCurveTo(iw / 2, -ih / 2, iw / 2, -ih / 2 + ir);
  hole.lineTo(iw / 2, ih / 2 - ir);
  hole.quadraticCurveTo(iw / 2, ih / 2, iw / 2 - ir, ih / 2);
  hole.lineTo(-iw / 2 + ir, ih / 2);
  hole.quadraticCurveTo(-iw / 2, ih / 2, -iw / 2, ih / 2 - ir);
  hole.lineTo(-iw / 2, -ih / 2 + ir);
  hole.quadraticCurveTo(-iw / 2, -ih / 2, -iw / 2 + ir, -ih / 2);
  outer.holes.push(hole);
  return outer;
}

// Build a V-shaped polyline as a closed shape with stroke thickness, ready to extrude.
function makeVStrokeShape(
  points: THREE.Vector2[],
  strokeWidth: number
): THREE.Shape {
  const half = strokeWidth / 2;
  const left: THREE.Vector2[] = [];
  const right: THREE.Vector2[] = [];

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const prev = points[i - 1];
    const next = points[i + 1];

    let nx = 0;
    let ny = 0;

    if (prev && next) {
      const d1 = new THREE.Vector2().subVectors(p, prev).normalize();
      const d2 = new THREE.Vector2().subVectors(next, p).normalize();
      const tangent = new THREE.Vector2().addVectors(d1, d2).normalize();
      // Perpendicular to tangent
      nx = -tangent.y;
      ny = tangent.x;
      // Miter length adjust
      const miter = 1 / Math.max(0.2, Math.cos(d1.angle() - tangent.angle()));
      nx *= miter;
      ny *= miter;
    } else if (next) {
      const d = new THREE.Vector2().subVectors(next, p).normalize();
      nx = -d.y;
      ny = d.x;
    } else if (prev) {
      const d = new THREE.Vector2().subVectors(p, prev).normalize();
      nx = -d.y;
      ny = d.x;
    }

    left.push(new THREE.Vector2(p.x + nx * half, p.y + ny * half));
    right.push(new THREE.Vector2(p.x - nx * half, p.y - ny * half));
  }

  const shape = new THREE.Shape();
  shape.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < left.length; i++) shape.lineTo(left[i].x, left[i].y);
  for (let i = right.length - 1; i >= 0; i--)
    shape.lineTo(right[i].x, right[i].y);
  shape.closePath();
  return shape;
}

export default function EmailIcon3D({ size = 56, onClick }: Props) {
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

    // Geometry — Lucide Mail icon dimensions, centered.
    // Original SVG: rect x=2 y=4 w=20 h=16 (rx=2). V from (22,7)→(13,12.73)→(2,7).
    // Shift so envelope is centered at (0,0) with y up.
    const W = 20;
    const H = 16;
    const R = 2;
    const SW = 1.5; // visual stroke width

    const envelopeShape = makeRoundedRectRingShape(W, H, R, SW);

    // V points in centered coords (y flipped so positive is up).
    // Original (x, y) → (x - 12, -(y - 12)).
    const vPoints = [
      new THREE.Vector2(22 - 12, -(7 - 12)),
      new THREE.Vector2(13 - 12, -(12.73 - 12)),
      new THREE.Vector2(2 - 12, -(7 - 12)),
    ];
    const vShape = makeVStrokeShape(vPoints, SW);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 1.6,
      bevelEnabled: true,
      bevelThickness: 0.22,
      bevelSize: 0.22,
      bevelSegments: 5,
      curveSegments: 28,
    };

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xff3b30,
      metalness: 0.35,
      roughness: 0.24,
      clearcoat: 0.95,
      clearcoatRoughness: 0.12,
      reflectivity: 0.7,
    });

    const envelopeGeo = new THREE.ExtrudeGeometry(envelopeShape, extrudeSettings);
    const envelopeMesh = new THREE.Mesh(envelopeGeo, material);

    const vGeo = new THREE.ExtrudeGeometry(vShape, extrudeSettings);
    const vMesh = new THREE.Mesh(vGeo, material);

    const group = new THREE.Group();
    group.add(envelopeMesh);
    group.add(vMesh);

    // Center geometry in z so rotation looks balanced.
    group.position.z = -extrudeSettings.depth! / 2;

    const wrapper = new THREE.Group();
    wrapper.add(group);
    scene.add(wrapper);

    // Fit to view
    const box = new THREE.Box3().setFromObject(wrapper);
    const sizeVec = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(sizeVec.x, sizeVec.y);
    const fit = 18 / maxDim;
    wrapper.scale.setScalar(fit);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(5, 7, 8);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xffb3a8, 0.85);
    rim.position.set(-6, -3, 4);
    scene.add(rim);

    const fill = new THREE.PointLight(0xfff1c8, 0.55, 60);
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
  }, [size]);

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
      aria-label="Email"
      role={onClick ? "button" : undefined}
    />
  );
}
