import { useEffect, useRef } from 'react';

interface NetworkMeshProps {
  isDark: boolean;
}

export function NetworkMesh({ isDark }: NetworkMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let curRotX = 0;
    let curRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - width / 2) / (width / 2);
      mouseY = (e.clientY - height / 2) / (height / 2);
      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.45;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3D Tesseract / Consensus Hypercube Vertices
    // 16 4D vertices projected into 3D space
    const vertices4D: number[][] = [];
    for (let x of [-1, 1]) {
      for (let y of [-1, 1]) {
        for (let z of [-1, 1]) {
          for (let w of [-1, 1]) {
            vertices4D.push([x, y, z, w]);
          }
        }
      }
    }

    // Edges between vertices that differ in exactly one coordinate
    const edges: [number, number][] = [];
    for (let i = 0; i < vertices4D.length; i++) {
      for (let j = i + 1; j < vertices4D.length; j++) {
        let diff = 0;
        for (let k = 0; k < 4; k++) {
          if (vertices4D[i][k] !== vertices4D[j][k]) diff++;
        }
        if (diff === 1) edges.push([i, j]);
      }
    }

    let angle4D = 0;
    let baseAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      curRotX += (targetRotX - curRotX) * 0.05;
      curRotY += (targetRotY - curRotY) * 0.05;

      baseAngle += 0.003;
      angle4D += 0.005;

      const cos4 = Math.cos(angle4D);
      const sin4 = Math.sin(angle4D);
      const cosY = Math.cos(baseAngle + curRotY);
      const sinY = Math.sin(baseAngle + curRotY);
      const cosX = Math.cos(curRotX + 0.35);
      const sinX = Math.sin(curRotX + 0.35);

      // Project 4D to 3D and then to 2D
      const projected: { x: number; y: number; z: number }[] = [];
      const scale = Math.min(width, height) * 0.28;
      const originX = width > 1024 ? width * 0.72 : width * 0.5;
      const originY = height > 768 ? height * 0.42 : height * 0.35;

      for (let v of vertices4D) {
        // Rotate in XW plane
        let x1 = v[0] * cos4 - v[3] * sin4;
        let y1 = v[1];
        let z1 = v[2];
        let w1 = v[0] * sin4 + v[3] * cos4;

        // Perspective divide for 4D -> 3D
        const dist4 = 2.4;
        const p4 = 1 / (dist4 - w1 * 0.6);
        let x2 = x1 * p4;
        let y2 = y1 * p4;
        let z2 = z1 * p4;

        // Rotate in 3D (Y axis)
        let x3 = x2 * cosY - z2 * sinY;
        let z3 = x2 * sinY + z2 * cosY;

        // Rotate in 3D (X axis)
        let y4 = y2 * cosX - z3 * sinX;
        let z4 = y2 * sinX + z3 * cosX;

        // 3D perspective projection to 2D screen
        const fov = 3.2;
        const p3 = fov / (fov + z4);
        projected.push({
          x: originX + x3 * p3 * scale,
          y: originY + y4 * p3 * scale,
          z: z4,
        });
      }

      // Draw wireframe edges
      ctx.lineWidth = 1;
      for (let [i, j] of edges) {
        const p1 = projected[i];
        const p2 = projected[j];

        // Depth cueing
        const avgZ = (p1.z + p2.z) / 2;
        const alpha = Math.max(0.04, Math.min(0.35, 0.2 + avgZ * 0.1));

        ctx.strokeStyle = isDark
          ? `rgba(255, 255, 255, ${alpha})`
          : `rgba(15, 23, 42, ${alpha * 0.85})`;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Draw vertex nodes
      for (let p of projected) {
        ctx.fillStyle = isDark
          ? 'rgba(255, 255, 255, 0.7)'
          : 'rgba(15, 23, 42, 0.6)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-70 dark:opacity-80"
    />
  );
}
