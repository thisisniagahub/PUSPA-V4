'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function SpotlightCursor() {
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    setMounted(true);
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const target = e.target as HTMLElement;
      setIsHovering(
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') !== null ||
        target.closest('.glass') !== null
      );
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  if (!mounted) return null;

  return (
    <>
      {/* Global Spotlight (Large faint glow) */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[999] opacity-20"
        style={{
          background: `radial-gradient(600px circle at ${cursorXSpring}px ${cursorYSpring}px, rgba(124, 58, 237, 0.15), transparent 80%)`,
        }}
      />

      {/* Main Cursor (Interactive Ring) */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[1000] h-6 w-6 rounded-full border-2 border-primary mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
          scale: isHovering ? 2.5 : 1,
          backgroundColor: isHovering ? "rgba(124, 58, 237, 0.2)" : "transparent",
        }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
      />
      
      {/* Center Dot */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[1001] h-1 w-1 rounded-full bg-primary shadow-[0_0_10px_#7c3aed]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </>
  );
}
