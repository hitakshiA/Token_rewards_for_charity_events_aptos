import { Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
  ] as const;

  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <CurrentIcon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors duration-300" />
        
        {/* Pink glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Theme picker dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-12 z-50 min-w-[140px] bg-card border border-border rounded-xl shadow-lg backdrop-blur-sm"
            >
              <div className="p-2 space-y-1">
                {themes.map((themeOption) => {
                  const Icon = themeOption.icon;
                  const isActive = theme === themeOption.value;
                  
                  return (
                    <motion.button
                      key={themeOption.value}
                      onClick={() => {
                        setTheme(themeOption.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-nunito transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-foreground hover:bg-muted hover:text-primary'
                      }`}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{themeOption.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTheme"
                          className="ml-auto w-2 h-2 bg-primary-foreground rounded-full"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Pink accent border */}
              <div className="absolute inset-0 rounded-xl border border-primary/20 pointer-events-none"></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;