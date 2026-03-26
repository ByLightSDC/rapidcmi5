import { useEffect, useRef } from "react";

export function useSmokeBurst(trigger: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const SIZE = 240;
    canvas.width = SIZE;
    canvas.height = SIZE;

    let puffs = Array.from({ length: 18 }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const speed = 0.3 + Math.random() * 0.8;
      const radius = 6 + Math.random() * 10;
      const gray = Math.floor(120 + Math.random() * 80);
      return {
        x: SIZE / 2 + (Math.random() - 0.5) * 18,
        y: SIZE / 2 + (Math.random() - 0.5) * 18,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.4,
        vy: Math.sin(angle) * speed,
        radius,
        maxRadius: radius * (2.2 + Math.random() * 1.5),
        alpha: 0.35 + Math.random() * 0.2,
        decay: 0.007 + Math.random() * 0.006,
        gray,
        drift: (Math.random() - 0.5) * 0.25,
      };
    });

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      puffs = puffs.filter(p => p.alpha > 0.01);
      for (const p of puffs) {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(${p.gray},${p.gray},${p.gray},${p.alpha})`);
        grad.addColorStop(1, `rgba(${p.gray},${p.gray},${p.gray},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx + p.drift;
        p.y += p.vy;
        p.vy -= 0.012;
        p.vx *= 0.99;
        p.radius = Math.min(p.radius + 0.55, p.maxRadius);
        p.alpha -= p.decay;
      }
      if (puffs.length > 0) animId = requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, SIZE, SIZE);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [trigger]);

  return canvasRef;
}