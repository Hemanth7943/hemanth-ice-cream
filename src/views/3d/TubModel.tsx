'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FlavourConfig, generateTubTexture } from './TextureGenerator';

interface TubModelProps {
  flavour: FlavourConfig;
  size: 'G500' | 'G1000';
  isHovered?: boolean;
}

export const TubModel: React.FC<TubModelProps> = ({ flavour, size, isHovered = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyMeshRef = useRef<THREE.Mesh>(null);

  // Dynamic texture generated for current flavour & size
  const sizeLabel = size === 'G500' ? '500g' : '1000g';
  const labelTexture = useMemo(() => {
    return generateTubTexture(flavour, sizeLabel);
  }, [flavour, sizeLabel]);

  // Target dimensions based on size (500g vs 1000g)
  const targetScale = useMemo(() => {
    return size === 'G500'
      ? { scaleY: 1.0, scaleXZ: 1.0, yOffset: 0.0 }
      : { scaleY: 1.28, scaleXZ: 1.15, yOffset: 0.2 };
  }, [size]);

  // Metallic Gold Material definitions
  const goldMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      metalness: 0.88,
      roughness: 0.22,
      envMapIntensity: 1.5,
    });
  }, []);

  const goldAccentMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F3E5AB'),
      metalness: 0.95,
      roughness: 0.15,
      envMapIntensity: 2.0,
    });
  }, []);

  // Tub body material with the high-res canvas label texture
  const bodyMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: labelTexture,
      roughness: 0.35,
      metalness: 0.15,
      bumpScale: 0.02,
    });
  }, [labelTexture]);

  useEffect(() => {
    if (bodyMeshRef.current) {
      bodyMeshRef.current.material = bodyMaterial;
    }
  }, [bodyMaterial]);

  // Smooth frame updates (floating, gentle auto-turn, size lerp)
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth Lerp scaling between 500g and 1000g
    groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale.scaleY, delta * 5);
    groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale.scaleXZ, delta * 5);
    groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale.scaleXZ, delta * 5);

    // Floating idle animation
    const t = state.clock.getElapsedTime();
    const hoverOffset = isHovered ? 0.2 : 0;
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.08 + targetScale.yOffset + hoverOffset;

    // Subtle gentle idle rotation
    if (!isHovered) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      {/* 1. Main Tapered Cylindrical Tub Body */}
      {/* RadiusTop: 1.45, RadiusBottom: 1.25, Height: 2.4 */}
      <mesh ref={bodyMeshRef} position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.45, 1.25, 2.4, 64, 1, false]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      {/* 2. Metallic 24K Gold Top Rim Band */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[1.48, 1.45, 0.08, 64]} />
        <primitive object={goldMaterial} attach="material" />
      </mesh>

      {/* 3. Luxury Gold Foil Beveled Lid */}
      <group position={[0, 1.32, 0]}>
        {/* Lid Overhang Lip */}
        <mesh castShadow>
          <cylinderGeometry args={[1.56, 1.54, 0.2, 64]} />
          <primitive object={goldMaterial} attach="material" />
        </mesh>

        {/* Lid Top Disc */}
        <mesh position={[0, 0.11, 0]} castShadow>
          <cylinderGeometry args={[1.54, 1.54, 0.04, 64]} />
          <primitive object={goldAccentMaterial} attach="material" />
        </mesh>

        {/* Embossed Crown Center Medallion */}
        <mesh position={[0, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.65, 0.65, 0.03, 32]} />
          <primitive object={goldMaterial} attach="material" />
        </mesh>
      </group>

      {/* 4. Bottom Metallic Gold Rim & Base Bevel */}
      <mesh position={[0, -1.2, 0]} castShadow>
        <cylinderGeometry args={[1.27, 1.22, 0.06, 64]} />
        <primitive object={goldMaterial} attach="material" />
      </mesh>
    </group>
  );
};
