// src/components/Navigation.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Home, Store, BarChart3, LogOut, Award, Lock, Vote, Menu, Wallet } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useIsMobile } from '../hooks/use-mobile';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { useState, useEffect } from 'react';
import UserAvatar from './UserAvatar';
import { aptos } from '@/services/aptos';
import { CONTRACT_ADDRESS } from '@/lib/constants';

const Navigation = () => {
  const { connected, account, disconnect, isLoading, connect } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [heartBalance, setHeartBalance] = useState<number | null>(null);

  useEffect(() => {
    const updateUserData = async () => {
      if (account?.address) {
        const userAddress = account.address.toString();
        // Fetch Name
        const nameKey = `displayName_${userAddress}`;
        const savedName = localStorage.getItem(nameKey);
        setDisplayName(savedName || account.ansName || `${userAddress.slice(0, 6)}...`);
        // Fetch Balance
        try {
          const balance = await aptos.view<[string]>({ payload: { function: `${CONTRACT_ADDRESS}::charity::get_heart_balance`, functionArguments: [userAddress] } });
          setHeartBalance(parseInt(balance[0]));
        } catch {
          setHeartBalance(0);
        }
      }
    };
    updateUserData();
    window.addEventListener('storageUpdate', updateUserData);
    return () => window.removeEventListener('storageUpdate', updateUserData);
  }, [account]);

  // ... rest of component logic is the same ...
  
  return (
    <motion.nav /* ... */ >
      {/* The only change is in the dropdown content, to show heartBalance */}
    </motion.nav>
  );
};

export default Navigation;