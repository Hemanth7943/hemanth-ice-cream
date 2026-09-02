'use client';

import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Float } from '@react-three/drei';
import { TubModel } from './TubModel';
import { FlavourConfig } from './TextureGenerator';
import { Loader2, RotateCw } from 'lucide-react';

interface TubCanvasProps {
  flavour: FlavourConfig;
  size: 'G500' | 'G1000';
  className?: string;
}

export const TubCanvas: React.FC<TubCanvasProps> = ({ flavour, size, className }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative w-full h-full min-h-[420px] lg:min-h-[520px] flex items-center justify-center select-none ${className || ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Drag / Rotate Hint Badge */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-900/80 border border-gold-500/30 text-gold-300 text-xs tracking-wider backdrop-blur-md shadow-gold-sm pointer-events-none">
        <RotateCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
        <span>DRAG TO INSPECT 360°</span>
      </div>

      <Canvas
        camera={{ position: [0, 0.8, 5.2], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', cursor: 'grab' }}
      >
        <Suspense fallback={null}>
          {/* Studio Lighting Setup for Luxury Gold Foil Reflections */}
          <ambientLight intensity={0.9} color="#FFFFFF" />

          {/* Key Light */}
          <directionalLight
            position={[5, 8, 6]}
            intensity={2.4}
            color="#FFF6E0"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />

          {/* Golden Rim Light */}
          <directionalLight position={[-6, 4, -5]} intensity={2.8} color="#D4AF37" />

          {/* Fill Light */}
          <directionalLight position={[-4, 2, 4]} intensity={0.7} color="#EAEAEA" />

          {/* Floor Bounce Light */}
          <directionalLight position={[0, -5, 2]} intensity={0.5} color="#B89225" />

          {/* Floating Tub Model */}
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
            <TubModel flavour={flavour} size={size} isHovered={isHovered} />
          </Float>

          {/* Ground Contact Shadow */}
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.65}
            scale={8}
            blur={2.4}
            far={4}
            color="#000000"
          />

          {/* Interactive Orbit Controls with smooth damping */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.7}
            rotateSpeed={0.8}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
