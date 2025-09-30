import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

interface AnimatedTextHeroProps {
  className?: string;
}

const AnimatedTextHero: React.FC<AnimatedTextHeroProps> = ({ className = "" }) => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // Import SplitText dynamically since it's a premium plugin
    // For now, we'll create a simple character split manually
    const splitText = (element: HTMLElement) => {
      const text = element.textContent || '';
      element.innerHTML = '';
      
      text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space
        span.classList.add('char');
        span.style.display = 'inline-block';
        element.appendChild(span);
      });
      
      return element.querySelectorAll('.char');
    };

    const h1Elements = textRef.current.querySelectorAll('h1');
    const tl = gsap.timeline();

    h1Elements.forEach((h1) => {
      const chars = splitText(h1 as HTMLElement);
      
      tl.from(chars, {
        y: 80,
        opacity: 0,
        stagger: 0.03,
        duration: 0.8,
        ease: "back.out(1.7)"
      }, "-=0.5");
    });

    // Add some floating elements animation
    tl.to('.floating-heart', {
      y: -20,
      rotation: 360,
      duration: 2,
      stagger: 0.2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut"
    }, "-=1");

  }, []);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="relative flex flex-col items-center justify-center min-h-[500px] lg:min-h-[600px] text-center"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute floating-heart text-2xl opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${1 + Math.random() * 2}rem`
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            >
              ❤️
            </motion.div>
          ))}
          
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`flower-${i}`}
              className="absolute text-3xl opacity-15"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                rotate: [0, 360],
                scale: [0.8, 1.3, 0.8]
              }}
              transition={{
                duration: 6 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "linear"
              }}
            >
              🌸
            </motion.div>
          ))}
        </div>

        {/* Main animated text */}
        <div ref={textRef} className="relative z-10 space-y-8">
          <h1 className="text-5xl lg:text-7xl font-shadows text-primary leading-tight">
            Transform Giving
          </h1>
          
          <h1 className="text-4xl lg:text-6xl font-shadows text-garden-glow leading-tight">
            Into Growing
          </h1>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.8 }}
            className="space-y-4"
          >
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto font-nunito">
              Every donation plants seeds of hope in your personal garden
            </p>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🌱</span>
                <span>Plant Seeds</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">❤️</span>
                <span>Earn HEART</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🌺</span>
                <span>Watch Grow</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Interactive elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3, duration: 1, type: "spring" }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 border-2 border-primary/20 rounded-full flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl"
              >
                🌻
              </motion.div>
            </motion.div>
            
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xs text-center mt-2 font-caveat text-primary"
            >
              Your garden awaits
            </motion.p>
          </div>
        </motion.div>

        {/* Particle-like elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedTextHero;