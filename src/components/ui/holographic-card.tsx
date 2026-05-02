'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export default function HolographicCard({
  children,
  className,
  glowColor = "rgba(192, 132, 252, 0.4)",
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Mouse position for tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth tilt values
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Transform mouse pos to rotation
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  // Mouse position for holographic glare
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Normalize values to -0.5 to 0.5
    x.set((mouseX / width) - 0.5);
    y.set((mouseY / height) - 0.5);

    // Update glare position (0 to 100)
    setGlarePos({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
    });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setGlarePos({ x: 50, y: 50 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative rounded-[2rem] border border-white/10 bg-card/40 backdrop-blur-2xl transition-all duration-300 group",
        "shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)] grain-overlay",
        className
      )}
    >
      {/* 3D Content Container */}
      <div style={{ transform: "translateZ(50px)" }} className="relative z-10 p-1">
        {children}
      </div>

      {/* Holographic Glare Effect */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
        }}
      />

      {/* Subtle Foil Shine (Diagonal) */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[2rem] opacity-10 mix-blend-overlay"
        style={{
          background: `linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.4) ${glarePos.x}%, transparent 100%)`,
        }}
      />

      {/* Outer Glow */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${glarePos.x}% ${glarePos.y}%, ${glowColor}, transparent 60%)`
        }}
      />
    </motion.div>
  );
}
