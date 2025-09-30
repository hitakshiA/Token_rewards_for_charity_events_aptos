import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas as FabricCanvas } from 'fabric';

interface ZenGardenProps {
  donationCount?: number;
  totalDonated?: number;
  className?: string;
}

interface Flower {
  x: number;
  y: number;
  size: number;
  color: string;
  bloomStage: number;
  petals: number;
  stemHeight: number;
  angle: number;
}

const ZenGarden: React.FC<ZenGardenProps> = ({ 
  donationCount = 0, 
  totalDonated = 0,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [flowers, setFlowers] = useState<Flower[]>([]);

  // Calculate garden growth - always show at least 3 flowers
  const maxFlowers = Math.min(Math.floor(donationCount * 1.5) + 3, 12);
  const gardenMaturity = Math.min(totalDonated / 5000, 1);

  const flowerColors = [
    '#FF69B4', // Hot pink
    '#FF1493', // Deep pink  
    '#FFB6C1', // Light pink
    '#FF6347', // Coral
    '#DDA0DD', // Plum
    '#98FB98', // Pale green
    '#87CEEB', // Sky blue
    '#FFA07A', // Light salmon
  ];

  // Generate flowers based on donations
  useEffect(() => {
    const newFlowers: Flower[] = [];
    for (let i = 0; i < maxFlowers; i++) {
      const angle = (i / maxFlowers) * Math.PI * 2;
      const radius = 60 + Math.random() * 80;
      const centerX = 200;
      const centerY = 150;
      
      newFlowers.push({
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
        size: 8 + Math.random() * 12,
        color: flowerColors[i % flowerColors.length],
        bloomStage: 1, // Always fully bloomed for zen garden
        petals: 5 + Math.floor(Math.random() * 3),
        stemHeight: 20 + Math.random() * 15,
        angle: Math.random() * Math.PI * 2
      });
    }
    setFlowers(newFlowers);
  }, [donationCount, maxFlowers]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 300,
      backgroundColor: 'transparent',
      selection: false,
      hoverCursor: 'default',
      moveCursor: 'default'
    });

    fabricCanvas.renderOnAddRemove = false;
    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Animation loop - gentle and peaceful
  useEffect(() => {
    if (!canvas) return;

    const animate = (timestamp: number) => {
      // Clear canvas
      canvas.clear();
      
      // Draw sky gradient background
      const ctx = canvas.getContext();
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(135, 206, 235, 0.3)'); // Sky blue
      gradient.addColorStop(0.7, 'rgba(144, 238, 144, 0.2)'); // Light green
      gradient.addColorStop(1, 'rgba(34, 139, 34, 0.1)'); // Forest green
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 300);

      // Draw ground
      const groundGradient = ctx.createLinearGradient(0, 250, 0, 300);
      groundGradient.addColorStop(0, 'rgba(139, 69, 19, 0.2)');
      groundGradient.addColorStop(1, 'rgba(101, 67, 33, 0.3)');
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, 250, 400, 50);

      // Draw zen elements - rocks
      ctx.fillStyle = 'rgba(128, 128, 128, 0.4)';
      ctx.beginPath();
      ctx.ellipse(100, 200, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(320, 220, 12, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw flowers with gentle sway
      flowers.forEach((flower, index) => {
        const time = timestamp * 0.0005; // Very slow movement
        const sway = Math.sin(time + index) * 1; // Gentle sway
        
        // Draw stem
        ctx.strokeStyle = 'rgba(34, 139, 34, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(flower.x, flower.y + flower.stemHeight);
        ctx.lineTo(flower.x + sway, flower.y);
        ctx.stroke();

        // Draw flower
        const flowerX = flower.x + sway;
        const flowerY = flower.y;
        
        // Petals
        ctx.fillStyle = flower.color;
        for (let p = 0; p < flower.petals; p++) {
          const petalAngle = (p / flower.petals) * Math.PI * 2 + flower.angle;
          const petalX = flowerX + Math.cos(petalAngle) * flower.size;
          const petalY = flowerY + Math.sin(petalAngle) * flower.size * 0.6;
          
          ctx.beginPath();
          ctx.ellipse(petalX, petalY, flower.size * 0.3, flower.size * 0.6, petalAngle, 0, Math.PI * 2);
          ctx.fill();
        }

        // Flower center
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(flowerX, flowerY, flower.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw gentle sparkles based on donation amount
      const sparkleCount = Math.floor(gardenMaturity * 8) + 2;
      for (let i = 0; i < sparkleCount; i++) {
        const sparkleTime = timestamp * 0.002 + i;
        const sparkleX = 50 + (i * 43) % 300;
        const sparkleY = 50 + Math.sin(sparkleTime) * 20 + (i * 29) % 100;
        const sparkleAlpha = (Math.sin(sparkleTime) + 1) * 0.2;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      canvas.renderAll();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [canvas, flowers, gardenMaturity]);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <canvas 
          ref={canvasRef}
          className="rounded-3xl shadow-[var(--shadow-garden)] border border-border/20 bg-gradient-to-b from-sky-50/30 to-green-50/30 block"
          width={400}
          height={300}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {/* Growth indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center"
        >
          <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50 shadow-sm">
            <p className="text-sm font-caveat text-primary font-semibold">
              {maxFlowers <= 3 ? "Your zen garden awaits 🌱" : 
               maxFlowers < 6 ? "Peaceful blooms growing 🌸" :
               maxFlowers < 9 ? "Tranquil garden flourishing 🌺" :
               "Perfect harmony achieved 🌷"}
            </p>
            <p className="text-xs text-muted-foreground">
              {maxFlowers} flowers • Zen mode
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ZenGarden;