// src/components/UserAvatar.tsx

import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Accept a className prop to allow custom sizing
interface UserAvatarProps {
  className?: string;
}

const UserAvatar = ({ className }: UserAvatarProps) => {
  const { account } = useWallet();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  useEffect(() => {
    if (account?.address) {
      const storageKey = `profilePicture_${account.address.toString()}`;
      const storedImage = localStorage.getItem(storageKey);

      if (storedImage) {
        setAvatarSrc(storedImage);
      } else {
        const defaultAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${account.address.toString()}`;
        setAvatarSrc(defaultAvatarUrl);
      }
    }
  }, [account]);

  // When this component re-renders due to a save, this listener will update the image
  useEffect(() => {
    const handleStorageChange = () => {
      if (account?.address) {
        const storageKey = `profilePicture_${account.address.toString()}`;
        const storedImage = localStorage.getItem(storageKey);
        setAvatarSrc(storedImage);
      }
    };

    window.addEventListener('storageUpdate', handleStorageChange);
    return () => {
      window.removeEventListener('storageUpdate', handleStorageChange);
    };
  }, [account]);


  return (
    // Pass the className to the Avatar component
    <Avatar className={cn("w-8 h-8", className)}>
      {avatarSrc ? (
        <AvatarImage src={avatarSrc} alt="User Avatar" className="object-cover" />
      ) : (
        <AvatarFallback>
          {/* Make the fallback icon larger to fill the space better */}
          <User className="w-1/2 h-1/2" />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;