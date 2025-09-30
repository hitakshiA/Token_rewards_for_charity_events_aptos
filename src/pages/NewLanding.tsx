import { useEffect, useRef, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Sparkles, Globe } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import AdvancedBackground from '../components/AdvancedBackground';

const NewLanding = () => {
  const { connect, isConnected } = useWallet();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subtle 3D mouse tracking effect for text
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;
      
      const rotateY = deltaX * 5;
      const rotateX = -deltaY * 5;
      
      const hero = containerRef.current.querySelector('.hero-3d') as HTMLElement;
      
      if (hero) {
        hero.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Advanced WebGL Background */}
      <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 -z-10" />}>
        <AdvancedBackground />
      </Suspense>
      
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="hero-3d transition-transform duration-200 ease-out transform-gpu">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center space-y-8 px-4"
          >
            {/* Main Title */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, scale: 0.8, rotateX: 45 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="font-shadows text-6xl md:text-8xl lg:text-9xl text-foreground leading-tight"
                style={{
                  textShadow: '0 0 30px rgba(255, 105, 180, 0.5), 0 0 60px rgba(255, 105, 180, 0.3)',
                  background: 'linear-gradient(45deg, #ff69b4, #9966cc, #ff1493)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 4px 8px rgba(255, 105, 180, 0.3))'
                }}
              >
                CHARITY
                <motion.span
                  className="block"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                >
                  REWARDS
                </motion.span>
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 1, 
                  type: "spring",
                  stiffness: 100
                }}
                className="flex justify-center"
              >
                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
              </motion.div>
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1, delay: 1.2 }}
              className="text-2xl md:text-3xl font-caveat text-garden-text-accent max-w-3xl mx-auto leading-relaxed"
              style={{
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(2px)'
              }}
            >
              Transform your compassion into digital rewards
              <br />
              <span className="text-primary glow-text">
                Grow your garden of giving in the metaverse
              </span>
            </motion.p>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
            >
              <motion.div
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 20px 40px rgba(255, 105, 180, 0.4)',
                  rotateY: 5
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/marketplace"
                  className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl text-lg font-semibold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-lg hover:shadow-2xl hover:shadow-pink-500/25 transform hover:scale-[1.02] active:scale-[0.98] border border-white/20 transition-all duration-300 group"
                >
                  <Globe className="w-5 h-5" />
                  <span>Explore Marketplace</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              {!isConnected && (
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: -5
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button 
                    onClick={connect}
                    className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl text-lg font-semibold bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Connect Wallet</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section with 3D Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        viewport={{ once: true }}
        className="py-20 px-4 relative z-10"
      >
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center text-4xl md:text-5xl font-shadows text-foreground mb-16"
            style={{
              textShadow: '0 0 20px rgba(255, 105, 180, 0.3)',
            }}
          >
            Experience the Future of Giving
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Heart,
                title: 'Donate',
                description: 'Support verified charity campaigns with cryptocurrency donations'
              },
              {
                icon: Sparkles,
                title: 'Earn',
                description: 'Receive HEART tokens and unique NFT badges for your contributions'
              },
              {
                icon: Globe,
                title: 'Impact',
                description: 'Track your real-world impact and grow your digital garden'
              }
            ].map(({ icon: Icon, title, description }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 50, rotateX: 45 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 5,
                  boxShadow: '0 25px 50px rgba(255, 105, 180, 0.2)'
                }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card-garden p-8 text-center space-y-4 relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 105, 180, 0.2)'
                }}
              >
                <motion.div 
                  className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center relative"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className="w-8 h-8 text-primary" />
                </motion.div>
                <h3 className="text-xl font-nunito font-bold text-foreground">{title}</h3>
                <p className="text-muted-foreground font-nunito">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NewLanding;