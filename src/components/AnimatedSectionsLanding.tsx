import { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

import charityHero1 from '../assets/charity-hero-1-new.jpg';
import charityHero2 from '../assets/charity-hero-2.jpg';
import charityHero3 from '../assets/charity-hero-3.jpg';
import charityHero4 from '../assets/charity-hero-4.jpg';
import charityHero5 from '../assets/charity-hero-5.jpg';

gsap.registerPlugin(Observer);

const AnimatedSectionsLanding = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(-1);
  const animatingRef = useRef(false);
  const observerRef = useRef<any>(null);

  const sections = [
    {
      title: "Transform Lives Through Giving",
      subtitle: "",
      image: charityHero1,
      id: "first"
    },
    {
      title: "Blockchain-Powered Transparency", 
      subtitle: "Every donation tracked on the blockchain",
      image: charityHero2,
      id: "second"
    },
    {
      title: "Earn Rewards for Kindness",
      subtitle: "HEART tokens and unique NFT badges",
      image: charityHero3,
      id: "third"
    },
    {
      title: "Join the Community",
      subtitle: "Connect with like-minded givers worldwide",
      image: charityHero4,
      id: "fourth"
    },
    {
      title: "Ready to Make a Difference?",
      subtitle: "Start your giving journey today",
      image: charityHero5,
      id: "fifth"
    }
  ];

  const wrap = useCallback((index: number) => {
    const length = sections.length;
    return ((index % length) + length) % length;
  }, [sections.length]);

  const gotoSection = useCallback((index: number, direction: number) => {
    if (animatingRef.current) return;
    
    index = wrap(index);
    animatingRef.current = true;
    
    const fromTop = direction === -1;
    const dFactor = fromTop ? -1 : 1;
    
    const sectionsElements = gsap.utils.toArray(".animated-section") as Element[];
    const outerWrappers = gsap.utils.toArray(".outer") as Element[];
    const innerWrappers = gsap.utils.toArray(".inner") as Element[];
    const images = gsap.utils.toArray(".bg") as Element[];
    const headings = gsap.utils.toArray(".section-heading") as Element[];

    const tl = gsap.timeline({
      defaults: { duration: 1.25, ease: "power1.inOut" },
      onComplete: () => {
        animatingRef.current = false;
      }
    });

    if (currentIndexRef.current >= 0) {
      gsap.set(sectionsElements[currentIndexRef.current], { zIndex: 0 });
      tl.to(images[currentIndexRef.current], { yPercent: -15 * dFactor })
        .set(sectionsElements[currentIndexRef.current], { autoAlpha: 0 });
    }

    gsap.set(sectionsElements[index], { autoAlpha: 1, zIndex: 1 });
    tl.fromTo([outerWrappers[index], innerWrappers[index]], { 
        yPercent: (i: number) => i ? -100 * dFactor : 100 * dFactor
      }, { 
        yPercent: 0 
      }, 0)
      .fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0)
      .fromTo(headings[index], { 
          autoAlpha: 0, 
          yPercent: 150 * dFactor
      }, {
          autoAlpha: 1,
          yPercent: 0,
          duration: 1,
          ease: "power2"
        }, 0.2);

    currentIndexRef.current = index;
  }, [wrap]);

  const getActionButtons = (index: number) => {
    return (
      <Link to="/login">
        <Button 
          variant="premium" 
          size="lg"
          className="mt-6 md:mt-8 text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
        >
          <Heart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          Login
          <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
        </Button>
      </Link>
    );
  };

  useEffect(() => {
    console.log('AnimatedSectionsLanding: Initializing GSAP animations');
    
    try {
      const outerWrappers = gsap.utils.toArray(".outer");
      const innerWrappers = gsap.utils.toArray(".inner");
      
      console.log('Found outer wrappers:', outerWrappers.length);
      console.log('Found inner wrappers:', innerWrappers.length);
      
      if (outerWrappers.length > 0 && innerWrappers.length > 0) {
        gsap.set(outerWrappers, { yPercent: 100 });
        gsap.set(innerWrappers, { yPercent: -100 });

        observerRef.current = Observer.create({
          type: "wheel,touch,pointer",
          wheelSpeed: -1,
          onDown: () => !animatingRef.current && gotoSection(currentIndexRef.current - 1, -1),
          onUp: () => !animatingRef.current && gotoSection(currentIndexRef.current + 1, 1),
          tolerance: 10,
          preventDefault: true
        });

        console.log('GSAP Observer created successfully');

        const timer = setTimeout(() => {
          console.log('Starting first section');
          gotoSection(0, 1);
        }, 100);

        return () => {
          if (observerRef.current) {
            observerRef.current.kill();
          }
          clearTimeout(timer);
        };
      } else {
        console.error('Could not find required elements for GSAP animation');
      }
    } catch (error) {
      console.error('Error initializing GSAP animations:', error);
    }
  }, [gotoSection]);

  return (
    <div ref={containerRef} className="relative">
      <header className="animated-sections-header fixed top-0 w-full z-50 flex items-center justify-between px-[5%] h-28">
        <div className="text-white font-shadows text-sm tracking-[0.5em] uppercase">
          Charity Rewards
        </div>
        <Link 
          to="/marketplace" 
          className="text-white/80 hover:text-white transition-colors text-sm tracking-[0.5em] uppercase"
        >
          Enter Marketplace
        </Link>
      </header>

      {sections.map((section, index) => (
        <section
          key={section.id}
          className={`animated-section fixed top-0 w-full h-screen invisible ${section.id}`}
        >
          <div className="outer w-full h-full overflow-hidden">
            <div className="inner w-full h-full overflow-hidden">
              <div
                className="bg absolute top-0 w-full h-full bg-cover bg-center flex items-center justify-center"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 100%), url('${section.image}')`,
                }}
              >
                <div className="text-center text-white z-50 px-4 max-w-5xl">
                  <h2 className="section-heading font-shadows text-3xl md:text-5xl lg:text-7xl xl:text-8xl font-semibold leading-tight mb-4 md:mb-6 max-w-4xl mx-auto">
                    {section.title}
                  </h2>
                  <p className="text-base md:text-xl lg:text-2xl xl:text-3xl font-caveat text-white/90 mb-6 md:mb-8">
                    {section.subtitle}
                  </p>
                  {getActionButtons(index)}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 text-white/60 text-sm uppercase tracking-wider">
        Scroll to explore
      </div>
    </div>
  );
};

export default AnimatedSectionsLanding;