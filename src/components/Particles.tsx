import { useEffect, useRef } from 'react';

type ParticleType = 'dust' | 'stars' | 'rain' | 'glow' | 'none';

type Props = {
  type: ParticleType;
  color?: string;
  count?: number;
};

export default function Particles({ type, color = '#c9a96e', count = 30 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (type === 'none') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      life: number;
    }> = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const initParticles = () => {
      particles = [];
      const actualCount = type === 'rain' ? count * 2 : count;
      for (let i = 0; i < actualCount; i++) {
        if (type === 'rain') {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: -0.5,
            vy: 3 + Math.random() * 4,
            size: 1,
            opacity: 0.2 + Math.random() * 0.3,
            life: 1,
          });
        } else if (type === 'stars') {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            size: Math.random() * 1.5 + 0.3,
            opacity: Math.random() * 0.6 + 0.2,
            life: Math.random() * 200 + 100,
          });
        } else if (type === 'dust') {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.2,
            vy: -Math.random() * 0.15 - 0.05,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.3 + 0.05,
            life: 1,
          });
        } else if (type === 'glow') {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            size: Math.random() * 40 + 20,
            opacity: Math.random() * 0.08 + 0.02,
            life: 1,
          });
        }
      }
    };
    initParticles();

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Twinkle for stars
        let drawOpacity = p.opacity;
        if (type === 'stars') {
          drawOpacity = p.opacity * (0.5 + 0.5 * Math.sin(frame * 0.02 + p.x));
        }

        ctx.beginPath();
        if (type === 'glow') {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `${color}${Math.floor(drawOpacity * 255).toString(16).padStart(2, '0')}`);
          grad.addColorStop(1, `${color}00`);
          ctx.fillStyle = grad;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (type === 'rain') {
          ctx.strokeStyle = `${color}${Math.floor(drawOpacity * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = p.size;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
          ctx.stroke();
        } else {
          ctx.fillStyle = `${color}${Math.floor(drawOpacity * 255).toString(16).padStart(2, '0')}`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [type, color, count]);

  if (type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
