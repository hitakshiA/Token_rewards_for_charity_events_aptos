import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Heart, ArrowDown, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import charity images
import charity1 from '../assets/charity-1.jpg';
import charity2 from '../assets/charity-2.jpg';
import charity3 from '../assets/charity-3.jpg';
import charity4 from '../assets/charity-4.jpg';
import charity5 from '../assets/charity-5.jpg';
import charity6 from '../assets/charity-6.jpg';
import charity7 from '../assets/charity-7.jpg';
import charity8 from '../assets/charity-8.jpg';
import charity9 from '../assets/charity-9.jpg';
import charity10 from '../assets/charity-10.jpg';
import pattern1 from '../assets/pattern-1.jpg';
import pattern2 from '../assets/pattern-2.jpg';
import pattern3 from '../assets/pattern-3.jpg';
import pattern4 from '../assets/pattern-4.jpg';
import pattern5 from '../assets/pattern-5.jpg';
import pattern6 from '../assets/pattern-6.jpg';

// gsap.registerPlugin(Observer);

const GSAPVerticalGallery: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const loopsRef = useRef<gsap.core.Timeline[]>([]);

  const columnData = [
    [pattern1, charity1, charity3, pattern2, charity5, pattern3, charity7, pattern4, charity9, pattern5],
    [pattern3, charity2, charity4, pattern1, charity6, charity8, pattern6, charity10, pattern2, charity7],
    [pattern2, charity3, charity5, pattern4, charity8, charity6, pattern5, charity9, charity10, pattern6]
  ];

  useEffect(() => {
    if (!wrapperRef.current) return;

    const wrapper = wrapperRef.current;
    const columns = gsap.utils.toArray('.gallery-column', wrapper) as HTMLElement[];
    
    // Set initial opacity to 0 for smooth fade in
    gsap.set(columns, { autoAlpha: 0 });
    
    let handleWheel: (e: WheelEvent) => void;

    const createVerticalLoop = (items: HTMLElement[], config: any = {}) => {
      items = gsap.utils.toArray(items) as HTMLElement[];
      config = config || {};
      
      const tl = gsap.timeline({
        repeat: config.repeat || -1,
        paused: config.paused || false,
        defaults: { ease: "none" },
        onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)
      });

      const length = items.length;
      const startY = (items[0] as HTMLElement).offsetTop;
      const times: number[] = [];
      const heights: number[] = [];
      const spaceBefore: number[] = [];
      const yPercents: number[] = [];
      const pixelsPerSecond = (config.speed || 1) * 100;
      const snap = (v: number) => Math.round(v);

      const populateHeights = () => {
        items.forEach((el, i) => {
          const element = el as HTMLElement;
          heights[i] = parseFloat(gsap.getProperty(element, "height", "px") as string);
          yPercents[i] = snap((parseFloat(gsap.getProperty(element, "y", "px") as string) / heights[i]) * 100 + 
                              parseFloat(gsap.getProperty(element, "yPercent") as string));
          if (i > 0) {
            spaceBefore[i] = element.offsetTop - (items[i-1] as HTMLElement).offsetTop - heights[i-1];
          } else {
            spaceBefore[i] = 0;
          }
        });
        gsap.set(items, { yPercent: (i) => yPercents[i] });
      };

      const populateTimeline = () => {
        tl.clear();
        const totalHeight = items.reduce((sum, item, i) => sum + heights[i] + spaceBefore[i], 0);
        
        items.forEach((item, i) => {
          const curY = (yPercents[i] / 100) * heights[i];
          const distanceToStart = (item as HTMLElement).offsetTop + curY - startY + spaceBefore[0];
          const distanceToLoop = distanceToStart + heights[i];
          
          tl.to(item, {
            yPercent: snap(((curY - distanceToLoop) / heights[i]) * 100),
            duration: distanceToLoop / pixelsPerSecond
          }, 0)
          .fromTo(item, {
            yPercent: snap(((curY - distanceToLoop + totalHeight) / heights[i]) * 100)
          }, {
            yPercent: yPercents[i],
            duration: (curY - distanceToLoop + totalHeight - curY) / pixelsPerSecond,
            immediateRender: false
          }, distanceToLoop / pixelsPerSecond);
          
          times[i] = distanceToStart / pixelsPerSecond;
        });
      };

      gsap.set(items, { y: 0 });
      populateHeights();
      populateTimeline();
      
      tl.progress(1).progress(0);
      
      return tl;
    };

    // Wait for images to load
    const images = wrapper.querySelectorAll('img');
    let loadedImages = 0;
    
    const handleImageLoad = () => {
      loadedImages++;
    if (loadedImages === images.length) {
      const cleanup = initializeAnimation();
      
      // Store cleanup data for later use
      (wrapper as any)._cleanup = cleanup;
    }
    };

    images.forEach(img => {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad);
        img.addEventListener('error', handleImageLoad);
      }
    });

    const initializeAnimation = () => {
      const loops = columns.map((column, i) => {
        const items = gsap.utils.toArray('.gallery-item', column) as HTMLElement[];
        return createVerticalLoop(items, {
          repeat: -1,
          paddingBottom: 10,
          paused: false,
          speed: 0.5
        });
      });

      loopsRef.current = loops;

      // Set different starting times and initial timeScale to 0
      gsap.set(loops, {
        time: (i) => (i % 2) + 1,
        timeScale: 0
      });

      // Fade in columns
      gsap.set(columns, { autoAlpha: 1 });

      // Auto-scrolling animation instead of manual scroll
      const autoScrollTl = gsap.timeline({ repeat: -1 });
      
      // Smooth continuous scrolling
      autoScrollTl
        .to(loops, {
          timeScale: 0.8,
          duration: 4,
          ease: "power2.inOut"
        })
        .to(loops, {
          timeScale: -0.5,
          duration: 3,
          ease: "power2.inOut"
        })
        .to(loops, {
          timeScale: 1.2,
          duration: 5,
          ease: "power2.inOut"
        })
        .to(loops, {
          timeScale: -0.8,
          duration: 4,
          ease: "power2.inOut"
        });
      
      // Pause auto-scroll on hover to allow reading
      const contentElement = contentRef.current;
      if (contentElement) {
        contentElement.addEventListener('mouseenter', () => {
          gsap.to(loops, { timeScale: 0.1, duration: 0.5 });
        });
        
        contentElement.addEventListener('mouseleave', () => {
          autoScrollTl.resume();
        });
      }
      
      // Disable manual scrolling
      const preventScroll = (e: WheelEvent) => {
        e.preventDefault();
      };
      
      window.addEventListener('wheel', preventScroll, { passive: false });

      // Show/hide scroll indicator based on interaction
      let interactionTimeout: NodeJS.Timeout;
      const showScrollIndicator = () => {
        if (scrollIndicatorRef.current) {
          gsap.to(scrollIndicatorRef.current, { opacity: 1, duration: 0.3 });
        }
      };

      const hideScrollIndicator = () => {
        if (scrollIndicatorRef.current) {
          gsap.to(scrollIndicatorRef.current, { opacity: 0, duration: 0.3 });
        }
        clearTimeout(interactionTimeout);
        interactionTimeout = setTimeout(showScrollIndicator, 3000);
      };

      // Initially show scroll indicator
      showScrollIndicator();

      // Hide indicator on interaction
      window.addEventListener('touchstart', hideScrollIndicator);
      
      // Store cleanup functions
      return {
        loops,
        preventScroll,
        autoScrollTl
      };
    };

    // Cleanup function
    return () => {
      const cleanup = (wrapper as any)?._cleanup;
      if (cleanup) {
        cleanup.loops?.forEach((loop: any) => loop.kill());
        window.removeEventListener('wheel', cleanup.preventScroll);
        cleanup.autoScrollTl?.kill();
      }
      loopsRef.current.forEach(loop => loop.kill());
      gsap.killTweensOf("*");
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Overlay Content */}
      <div 
        ref={contentRef}
        className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center"
      >
        {/* Background for better text readability */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        
        <div className="relative text-center space-y-8 max-w-4xl mx-auto px-4 pointer-events-auto">
          <div className="bg-background/80 backdrop-blur-md rounded-3xl p-8 border border-border/20 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="text-primary font-nunito font-semibold text-lg">
                  Web3 Charitable Platform
                </span>
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-shadows text-foreground leading-tight">
                Transform Giving Into{' '}
                <span className="text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Growing
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Experience the future of charitable giving with blockchain transparency, 
                HEART token rewards, and your personalized virtual garden that grows with every donation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
              <Link
                to="/marketplace"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-2xl font-nunito font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-xl"
              >
                <Heart className="w-5 h-5" />
                <span>Start Growing</span>
              </Link>
              
              <Link
                to="/dashboard"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-4 rounded-2xl font-nunito font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-xl"
              >
                <Users className="w-5 h-5" />
                <span>Join Community</span>
              </Link>
            </div>
          </div>
          
          {/* Features highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { icon: "🔒", title: "Secure & Transparent", desc: "Blockchain verified donations" },
              { icon: "🌱", title: "Grow Your Garden", desc: "Visual representation of impact" },
              { icon: "❤️", title: "Earn HEART Tokens", desc: "Rewards for every donation" }
            ].map((feature, i) => (
              <div key={i} className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/20">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="font-nunito font-semibold text-foreground text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GSAP Gallery */}
      <div ref={wrapperRef} className="flex w-full h-screen gap-[2%] overflow-hidden">
        {columnData.map((columnImages, columnIndex) => (
          <div 
            key={columnIndex}
            className="gallery-column w-[32%] flex flex-col"
            style={{ willChange: 'transform' }}
          >
            {columnImages.map((imageSrc, imageIndex) => (
              <div 
                key={`${columnIndex}-${imageIndex}`}
                className="gallery-item w-full h-[300px] mb-[10px]"
              >
                <img 
                  src={imageSrc} 
                  alt={`Charity ${columnIndex + 1}-${imageIndex + 1}`}
                  className="w-full h-full object-cover object-center rounded-xl shadow-lg"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Scroll Indicator */}
      <div 
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 text-center opacity-0"
      >
        <div className="text-muted-foreground text-sm mb-2">Scroll to explore</div>
        <ArrowDown className="w-6 h-6 text-primary mx-auto animate-bounce" />
      </div>

      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/40 pointer-events-none z-10" />
    </div>
  );
};

export default GSAPVerticalGallery;