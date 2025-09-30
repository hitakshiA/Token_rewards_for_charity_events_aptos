import { useEffect, useRef } from 'react';

interface Flower {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  velocityX: number;
  velocityY: number;
  opacity: number;
  color: string;
  petals: number;
}

const FloatingFlowerParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flowersRef = useRef<Flower[]>([]);
  const animationRef = useRef<number>();

  const colors = ['#ff69b4', '#ffb6c1', '#ff1493', '#ffc0cb', '#da70d6', '#dda0dd'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize flowers
    const initFlowers = () => {
      flowersRef.current = [];
      const flowerCount = Math.min(15, Math.floor((canvas.width * canvas.height) / 50000));
      
      for (let i = 0; i < flowerCount; i++) {
        flowersRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 8 + 4,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          velocityX: (Math.random() - 0.5) * 0.5,
          velocityY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.6 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          petals: Math.floor(Math.random() * 3) + 5
        });
      }
    };

    const drawFlower = (flower: Flower) => {
      ctx.save();
      ctx.globalAlpha = flower.opacity;
      ctx.translate(flower.x, flower.y);
      ctx.rotate(flower.rotation);

      // Draw petals
      ctx.fillStyle = flower.color;
      for (let i = 0; i < flower.petals; i++) {
        const angle = (i * Math.PI * 2) / flower.petals;
        ctx.save();
        ctx.rotate(angle);
        
        // Petal shape
        ctx.beginPath();
        ctx.ellipse(flower.size * 0.6, 0, flower.size * 0.3, flower.size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw center
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 0, flower.size * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      flowersRef.current.forEach((flower) => {
        // Update position
        flower.x += flower.velocityX;
        flower.y += flower.velocityY;
        flower.rotation += flower.rotationSpeed;

        // Wrap around screen
        if (flower.x < -flower.size) flower.x = canvas.width + flower.size;
        if (flower.x > canvas.width + flower.size) flower.x = -flower.size;
        if (flower.y < -flower.size) flower.y = canvas.height + flower.size;
        if (flower.y > canvas.height + flower.size) flower.y = -flower.size;

        // Subtle opacity oscillation
        flower.opacity += Math.sin(Date.now() * 0.001 + flower.x * 0.01) * 0.002;
        flower.opacity = Math.max(0.1, Math.min(0.8, flower.opacity));

        drawFlower(flower);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    initFlowers();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default FloatingFlowerParticles;