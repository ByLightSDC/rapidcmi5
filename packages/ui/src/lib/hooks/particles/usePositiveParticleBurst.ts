import { useEffect, useRef } from 'react';

export function usePositiveParticleBurst(trigger: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const SIZE = 200;
    canvas.width = SIZE;
    canvas.height = SIZE;

    const COLORS = ['#1D9E75','#639922','#378ADD','#7F77DD','#FAC775','#F0997B'];
    let particles = Array.from({ length: 32 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 32 + (Math.random() - 0.5) * 0.4;
      const speed = 2.5 + Math.random() * 3;
      return {
        x: SIZE / 2, y: SIZE / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        size: 3 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        decay: 0.018 + Math.random() * 0.012,
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
      };
    });

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      particles = particles.filter(p => p.alpha > 0);
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }
        ctx.restore();
        p.x += p.vx; p.y += p.vy; p.vy += 0.08;
        p.alpha -= p.decay; p.rotation += p.rotSpeed; p.vx *= 0.98;
      }
      if (particles.length > 0) animId = requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, SIZE, SIZE);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [trigger]);

  return canvasRef;
}