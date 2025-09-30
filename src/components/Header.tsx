import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Wallet, User, LogOut, Home, Grid3X3, BarChart3 } from 'lucide-react';
import { gsap } from 'gsap';
import { useWallet } from '../contexts/WalletContext';
import { formatAPT } from '../mockData';
import { initExpandingCircles, activateExpandingCircles, deactivateExpandingCircles } from '../utils/menuAnimations';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { isConnected, isConnecting, currentUser, connect, disconnect } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const spotlightPointLightRef = useRef<SVGFEPointLightElement>(null);
  const linksRef = useRef<HTMLAnchorElement[]>([]);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Marketplace', href: '/marketplace', icon: Grid3X3 },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requiresAuth: true },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleWalletClick = async () => {
    if (!isConnected && !isConnecting) {
      await connect();
    }
  };

  const selectAnchor = (anchor: HTMLAnchorElement) => {
    if (!navRef.current || !spotlightPointLightRef.current) return;
    
    const navBounds = navRef.current.getBoundingClientRect();
    const anchorBounds = anchor.getBoundingClientRect();
    
    // Update active states
    linksRef.current.forEach(link => {
      if (link) {
        link.dataset.active = (anchor === link).toString();
      }
    });
    
    // Animate spotlight to new position
    gsap.to(spotlightPointLightRef.current, {
      duration: 0.25,
      attr: {
        x: anchorBounds.left - navBounds.left + anchorBounds.width * 0.5,
      },
    });
  };

  useEffect(() => {
    // Set initial active state based on current route
    const activeLink = linksRef.current.find(link => {
      if (!link) return false;
      const href = link.getAttribute('href');
      return href && isActivePath(href);
    });
    
    if (activeLink) {
      selectAnchor(activeLink);
    }

    // Initialize mobile menu animation
    if (mobileMenuRef.current) {
      initExpandingCircles(mobileMenuRef.current);
    }
  }, [location.pathname]);

  const handleMobileMenuClick = () => {
    if (!mobileMenuRef.current) return;
    
    const newState = !isMobileMenuActive;
    setIsMobileMenuActive(newState);
    
    if (newState) {
      activateExpandingCircles(mobileMenuRef.current);
    } else {
      deactivateExpandingCircles(mobileMenuRef.current);
    }
  };

  return (
    <>
      {/* SVG Filters for Spotlight Effect */}
      <svg className="sr-only">
        <filter id="spotlight">
          <feGaussianBlur
            in="SourceAlpha"
            stdDeviation="0.8"
            result="blur"
          />
          <feSpecularLighting
            result="lighting"
            in="blur"
            surfaceScale="0.5"
            specularConstant="6"
            specularExponent="65"
            lightingColor="hsla(234, 14%, 72%, 0.25)"
          >
            <fePointLight ref={spotlightPointLightRef} x="50" y="54" z="82" />
          </feSpecularLighting>
          <feComposite
            in="lighting"
            in2="SourceAlpha"
            operator="in"
            result="composite"
          />
          <feComposite
            in="merged"
            in2="composite"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="1"
            k4="0"
            result="litPaint"
          />
        </filter>
        <filter id="ambience">
          <feGaussianBlur
            in="SourceAlpha"
            stdDeviation="0.8"
            result="blur"
          />
          <feSpecularLighting
            result="lighting"
            in="blur"
            surfaceScale="0.5"
            specularConstant="25"
            specularExponent="65"
            lightingColor="hsla(234, 14%, 72%, 0.25)"
          >
            <fePointLight x="120" y="-154" z="160" />
          </feSpecularLighting>
          <feComposite
            in="lighting"
            in2="SourceAlpha"
            operator="in"
            result="composite"
          />
          <feComposite
            in="merged"
            in2="composite"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="1"
            k4="0"
            result="litPaint"
          />
        </filter>
      </svg>

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 backdrop-garden border-b border-border/20 header-curved-bottom"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with Diamond */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative diamond-logo">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  fill="currentColor"
                  className="w-8 h-8 text-primary"
                >
                  <path d="M480-120 80-600l120-240h560l120 240-400 480Zm-95-520h190l-60-120h-70l-60 120Zm55 347v-267H218l222 267Zm80 0 222-267H520v267Zm144-347h106l-60-120H604l60 120Zm-474 0h106l60-120H250l-60 120Z" />
                </svg>
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150 group-hover:scale-200 transition-transform duration-500" />
              </div>
              <div>
                <h1 className="text-2xl font-shadows text-primary">CharityRewards</h1>
                <p className="text-xs text-muted-foreground -mt-1">Digital Garden of Giving</p>
              </div>
            </Link>

            {/* Spotlight Navigation */}
            <nav 
              ref={navRef}
              className="hidden md:block spotlight-nav relative h-11 rounded-full border border-border/25"
              onClick={(e) => {
                // Find the closest anchor element
                const anchor = (e.target as Element).closest('a');
                if (anchor) {
                  selectAnchor(anchor as HTMLAnchorElement);
                }
              }}
            >
              {/* Lit overlay for spotlight effect */}
              <ul 
                aria-hidden="true" 
                className="lit absolute inset-0 z-10 flex items-center list-none m-0 p-0 text-sm pointer-events-none rounded-full"
                style={{ filter: 'url(#spotlight)' }}
              >
                {navigation.map(({ name, requiresAuth }) => {
                  if (requiresAuth && !isConnected) return null;
                  return (
                    <li key={name} className="px-5 py-2 h-full flex items-center">
                      {name}
                    </li>
                  );
                })}
              </ul>
              
              {/* Actual navigation content */}
              <ul className="content relative flex items-center list-none m-0 p-0 h-full text-sm rounded-full">
                {navigation.map(({ name, href, icon: Icon, requiresAuth }, index) => {
                  if (requiresAuth && !isConnected) return null;
                  
                  return (
                    <li key={name} className="h-full flex items-center">
                      <Link
                        ref={el => {
                          if (el) linksRef.current[index] = el;
                        }}
                        to={href}
                        data-active={isActivePath(href)}
                        className="flex items-center space-x-2 px-5 py-2 h-full text-foreground/60 hover:text-foreground transition-all duration-300 no-underline"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-nunito font-medium pointer-events-none">{name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              
              {/* Ambience border effect */}
              <div 
                className="absolute inset-0 rounded-full pointer-events-none border border-white/20" 
                style={{ filter: 'url(#ambience) brightness(2)' }}
              />
            </nav>

            {/* Mobile Menu Button with Expanding Circles Animation */}
            <div className="md:hidden">
              <div className="menu-container cursor-pointer" onClick={handleMobileMenuClick}>
                <div ref={mobileMenuRef} className="expanding-circles">
                  <div className="circle"></div>
                  <div className="circle"></div>
                  <div className="circle"></div>
                  <div className="circle"></div>
                  <div className="circle"></div>
                  <div className="circle"></div>
                  <div className="circle extra"></div>
                  <div className="circle extra"></div>
                  <div className="circle extra"></div>
                  <div className="circle extra"></div>
                  <div className="circle extra"></div>
                  <div className="circle extra"></div>
                  <div className="circle micro"></div>
                  <div className="circle micro"></div>
                  <div className="circle micro"></div>
                  <div className="circle micro"></div>
                  <div className="circle micro"></div>
                  <div className="circle micro"></div>
                  <div className="circle micro"></div>
                  <div className="circle micro"></div>
                  <div className="circle micro"></div>
                  <div className="circle micro"></div>
                  <div className="circle micro"></div>
                  <div className="circle micro"></div>
                </div>
              </div>
            </div>

            {/* Wallet Connection and Theme Toggle */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            {!isConnected ? (
              <motion.button
                onClick={handleWalletClick}
                disabled={isConnecting}
                className="btn-garden-primary flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet className="w-5 h-5" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </motion.button>
            ) : (
              <div className="relative">
                <motion.button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 px-4 py-2 bg-card rounded-full border border-border hover:shadow-[var(--shadow-glow)] transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-nunito font-semibold text-foreground">
                        {currentUser?.aptosName || 'Connected Wallet'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser?.heartTokens} ❤️ HEART
                      </p>
                    </div>
                  </div>
                </motion.button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-card rounded-2xl border border-border shadow-[var(--shadow-garden)] p-4"
                    >
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="font-nunito font-semibold text-foreground">
                            {currentUser?.aptosName}
                          </h3>
                          <p className="text-sm text-muted-foreground font-mono">
                            {currentUser?.address.slice(0, 6)}...{currentUser?.address.slice(-4)}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Donated</span>
                            <span className="font-nunito font-semibold">
                              {formatAPT(currentUser?.totalDonatedAPT || 0)} APT
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">HEART Tokens</span>
                      <span className="font-nunito font-semibold text-primary">
                        {currentUser?.heartTokens} ❤️ HEART
                      </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Campaigns Supported</span>
                            <span className="font-nunito font-semibold">
                              {currentUser?.donationCount}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border">
                          <Link
                            to="/dashboard"
                            className="block w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/10 rounded-lg transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <User className="w-4 h-4 inline mr-2" />
                            View Dashboard
                          </Link>
                          <button
                            onClick={() => {
                              disconnect();
                              setShowDropdown(false);
                            }}
                            className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4 inline mr-2" />
                            Disconnect
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          </div>
        </div>
      </motion.header>
    </>
  );
};

export default Header;