import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    createjs: any;
    Flower: any;
    FlowerRnd: any;
    SunFlower: any;
  }
}

const FlowerCanvas = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    // Load CreateJS and FlowerJS scripts dynamically
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initFlowers = async () => {
      try {
        // Load required scripts
        await loadScript('https://code.createjs.com/1.0.0/easeljs.min.js');
        await loadScript('https://code.createjs.com/1.0.0/tweenjs.min.js');
        await loadScript('https://jirotubuyaki.github.io/FlowerJS/flowerjs.js');

        // Wait a bit for scripts to be fully loaded
        setTimeout(() => {
          if (canvasRef.current && window.createjs && window.Flower) {
            initCanvas();
          }
        }, 100);
      } catch (error) {
        console.error('Failed to load FlowerJS dependencies:', error);
        // Fallback to simple canvas drawing
        drawFallbackFlowers();
      }
    };

    const initCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const stage = new window.createjs.Stage(canvas);
      stageRef.current = stage;

      // Create flowers with pink theme
      const flowers = [];
      
      // Create main flower
      const flower1 = new window.Flower();
      flower1.init()
        .setSize(60)
        .setPetalSize(70)
        .setColor("#ff69b4")
        .setPetal(8)
        .setPile(2, 1.2)
        .setAlpha(0.8)
        .create(canvas.width * 0.3, canvas.height * 0.6);
      
      flowers.push(flower1);
      stage.addChild(flower1.flower);

      // Create noise flower
      const flower2 = new window.FlowerRnd();
      flower2.init()
        .setSize(40)
        .setPetalSize(50)
        .setColor("#ffb6c1")
        .setPetal(6)
        .setPile(2, 1.1)
        .setAlpha(0.7)
        .setNoise(1.1)
        .create(canvas.width * 0.7, canvas.height * 0.4);
      
      flowers.push(flower2);
      stage.addChild(flower2.flower);

      // Create small flowers
      for (let i = 0; i < 3; i++) {
        const smallFlower = new window.Flower();
        smallFlower.init()
          .setSize(20 + Math.random() * 20)
          .setPetalSize(30 + Math.random() * 20)
          .setColor(i % 2 === 0 ? "#ff1493" : "#ffc0cb")
          .setPetal(5 + Math.floor(Math.random() * 4))
          .setPile(1, 1.0)
          .setAlpha(0.6)
          .create(
            Math.random() * canvas.width,
            canvas.height * 0.3 + Math.random() * canvas.height * 0.4
          );
        
        flowers.push(smallFlower);
        stage.addChild(smallFlower.flower);
      }

      // Add animations
      flowers.forEach((flower, index) => {
        const delay = index * 500;
        
        window.createjs.Tween.get(flower.flower, { loop: true })
          .wait(delay)
          .to({ rotation: 360 }, 8000, window.createjs.Ease.linear)
          .to({ rotation: 720 }, 8000, window.createjs.Ease.linear);

        // Petal animations
        if (flower.flower) {
          window.createjs.Tween.get(flower.flower, { loop: true })
            .wait(delay + 1000)
            .to({ scaleX: 1.1, scaleY: 1.1 }, 2000, window.createjs.Ease.cubicInOut)
            .to({ scaleX: 1.0, scaleY: 1.0 }, 2000, window.createjs.Ease.cubicInOut);
        }
      });

      // Start ticker
      window.createjs.Ticker.addEventListener("tick", handleTick);
      window.createjs.Ticker.framerate = 60;

      function handleTick() {
        stage.update();
      }
    };

    const drawFallbackFlowers = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Simple fallback flower drawing
      const drawFlower = (x: number, y: number, size: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        
        // Draw petals
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8;
          const petalX = x + Math.cos(angle) * size * 0.8;
          const petalY = y + Math.sin(angle) * size * 0.8;
          
          ctx.beginPath();
          ctx.ellipse(petalX, petalY, size * 0.4, size * 0.2, angle, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Draw center
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      };

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw fallback flowers
      drawFlower(canvas.width * 0.3, canvas.height * 0.6, 40, '#ff69b4');
      drawFlower(canvas.width * 0.7, canvas.height * 0.4, 30, '#ffb6c1');
      drawFlower(canvas.width * 0.2, canvas.height * 0.3, 20, '#ff1493');
      drawFlower(canvas.width * 0.8, canvas.height * 0.7, 25, '#ffc0cb');
    };

    initFlowers();

    return () => {
      if (stageRef.current) {
        window.createjs.Ticker.removeAllEventListeners();
        stageRef.current.removeAllChildren();
      }
    };
  }, []);

  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="w-full h-full object-contain"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
};

export default FlowerCanvas;