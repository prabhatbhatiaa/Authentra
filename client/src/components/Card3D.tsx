import React, { useState, useRef } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  withCrosshairs?: boolean;
}

export function Card3D({ children, className = '', withCrosshairs = false }: Card3DProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -6;
    const rotY = ((x - centerX) / centerX) * 6;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      style={{ perspective: 1200 }}
      className="relative transition-transform duration-200 ease-out h-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
        }}
        className={`relative overflow-hidden rounded-xl bg-white dark:bg-[#101014] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-sm hover:shadow-xl transition-all duration-300 ${className}`}
      >
        {withCrosshairs && (
          <>
            <span className="absolute top-1 left-1.5 font-mono text-[10px] text-zinc-400 dark:text-zinc-600 select-none pointer-events-none">+</span>
            <span className="absolute top-1 right-1.5 font-mono text-[10px] text-zinc-400 dark:text-zinc-600 select-none pointer-events-none">+</span>
            <span className="absolute bottom-1 left-1.5 font-mono text-[10px] text-zinc-400 dark:text-zinc-600 select-none pointer-events-none">+</span>
            <span className="absolute bottom-1 right-1.5 font-mono text-[10px] text-zinc-400 dark:text-zinc-600 select-none pointer-events-none">+</span>
          </>
        )}
        <div style={{ transform: 'translateZ(12px)' }}>{children}</div>
      </div>
    </div>
  );
}
