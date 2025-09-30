// src/components/GSAPMarketplace.tsx

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { Clock, Heart, Users } from 'lucide-react';
import { CharityEvent } from '../types';
import { calculateProgress, formatAPT, getTimeRemaining } from '../mockData';

interface GSAPMarketplaceProps {
  events: CharityEvent[];
}

const GSAPMarketplace: React.FC<GSAPMarketplaceProps> = ({ events }) => {
  const containerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.set(".swipeimage", { yPercent: -50, xPercent: -50 });
    let firstEnter: boolean;
    gsap.utils.toArray(".marketplace-item").forEach((el) => {
      const element = el as HTMLElement;
      const image = element.querySelector("img.swipeimage") as HTMLImageElement;
      if (!image) return;
      const setX = gsap.quickTo(image, "x", { duration: 0.6, ease: "power3.out" });
      const setY = gsap.quickTo(image, "y", { duration: 0.6, ease: "power3.out" });
      const align = (e: MouseEvent) => {
        if (firstEnter) {
          setX(e.clientX, e.clientX);
          setY(e.clientY, e.clientY);
          firstEnter = false;
        } else {
          setX(e.clientX);
          setY(e.clientY);
        }
      };
      const startFollow = () => document.addEventListener("mousemove", align);
      const stopFollow = () => document.removeEventListener("mousemove", align);
      const fade = gsap.to(image, {
        autoAlpha: 1, scale: 1, rotation: 0, ease: "power2.out",
        paused: true, duration: 0.3, onReverseComplete: stopFollow
      });
      const textArea = element.querySelector('.text-area') as HTMLElement;
      if (textArea) {
        textArea.addEventListener("mouseenter", (e) => {
          firstEnter = true;
          fade.play();
          startFollow();
          align(e);
        });
        textArea.addEventListener("mouseleave", () => {
          fade.reverse();
        });
      }
    });
  }, [events]);

  return (
    <div className="relative">
      <ul ref={containerRef} className="space-y-0 w-full" role="list">
        {events.map((event, index) => {
          const progress = calculateProgress(event.totalDonated, event.goalAmount);
          const timeRemaining = getTimeRemaining(event.endTimestamp);
          
          return (
            <motion.li
              key={event.eventAddress}
              className="marketplace-item relative border-b border-border/20 transition-colors duration-300 hover:bg-card/30"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <img
                className="swipeimage fixed top-0 left-0 w-80 h-60 object-cover rounded-2xl shadow-2xl opacity-0 invisible pointer-events-none z-10 border-4 border-white"
                src={event.imageUrl}
                alt={event.eventName}
                style={{ transform: 'translateX(-50%) translateY(-50%) scale(0.8) rotate(-5deg)' }}
              />
              <div className="p-8 lg:p-12 group">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <Link 
                    to={`/event/${event.eventAddress}`}
                    className="text-area flex-1 space-y-4 cursor-pointer block"
                  >
                    <div className="space-y-2">
                      <motion.h3 
                        className="text-3xl lg:text-4xl font-shadows text-foreground group-hover:text-primary transition-colors duration-300"
                        whileHover={{ x: 10 }}
                        transition={{ type: "spring", damping: 25 }}
                      >
                        {event.eventName}
                      </motion.h3>
                      <p className="text-lg text-primary font-nunito font-semibold">
                        {event.charityName}
                      </p>
                    </div>
                    
                    {/* --- THIS IS THE CHANGE --- */}
                    <p className="text-muted-foreground text-base lg:text-lg leading-relaxed max-w-2xl line-clamp-2">
                      {event.summary}
                    </p>
                    {/* --- END OF CHANGE --- */}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-nunito font-semibold text-foreground">
                          {Math.round(progress)}% funded
                        </span>
                        <span className="font-nunito text-muted-foreground">
                          {formatAPT(event.totalDonated)} / {formatAPT(event.goalAmount)} APT
                        </span>
                      </div>
                      <div className="progress-vine">
                        <motion.div
                          className="progress-vine-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </Link>
                  
                  <div className="flex flex-col lg:items-end space-y-4 lg:text-right">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-nunito font-medium">{timeRemaining}</span>
                    </div>
                    <div className="flex lg:flex-col gap-6 lg:gap-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span className="font-nunito">{Math.floor(event.totalDonated / 50) + 1} donors</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span className="text-primary">❤️</span>
                        <span className="font-nunito">{event.milestones.filter(m => event.totalDonated >= m.goalAmount).length} milestones</span>
                      </div>
                    </div>
                    <Link to={`/event/${event.eventAddress}`} className="relative z-30">
                      <motion.div
                        className="btn-garden-primary !px-8 !py-3 !text-base inline-flex items-center space-x-2"
                        whileHover={{ scale: 1.05, x: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Heart className="w-5 h-5" fill="currentColor" />
                        <span>Support Cause</span>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>
      <div className="fixed inset-0 pointer-events-none -z-10">
        {[...Array(6)].map((_, i) => (
          <motion.div key={i} className="absolute text-6xl opacity-5" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }} transition={{ duration: 20 + Math.random() * 10, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}>
            {['🌸', '🌺', '🌻', '🌷', '🌹', '❤️'][i]}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GSAPMarketplace;