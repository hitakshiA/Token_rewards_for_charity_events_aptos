// src/components/ProfilePictureModal.tsx

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Upload, User } from 'lucide-react';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newAvatarSrc: string) => void;
}

const ProfilePictureModal = ({ isOpen, onClose, onSave }: ProfilePictureModalProps) => {
  const { account } = useWallet();
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate a few default options for the user to pick from
  const defaultOptions = [
    `https://api.dicebear.com/7.x/bottts/svg?seed=${account?.address.toString()}`,
    `https://api.dicebear.com/7.x/identicon/svg?seed=${account?.address.toString()}`,
    `https://api.dicebear.com/7.x/pixel-art/svg?seed=${account?.address.toString()}`,
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${account?.address.toString()}`,
  ];

  useEffect(() => {
    // When the modal opens, set the initial selection to the current avatar
    if (isOpen && account?.address) {
      const storageKey = `profilePicture_${account.address.toString()}`;
      const currentImage = localStorage.getItem(storageKey) || defaultOptions[0];
      setSelectedAvatar(currentImage);
    }
  }, [isOpen, account]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setSelectedAvatar(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(selectedAvatar);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Profile Picture</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          <Avatar className="w-32 h-32">
            <AvatarImage src={selectedAvatar} />
            <AvatarFallback><User className="w-16 h-16" /></AvatarFallback>
          </Avatar>

          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/gif"
            onChange={handleFileUpload}
          />

          <div className="w-full">
            <p className="text-sm text-muted-foreground mb-2 text-center">Or select a default</p>
            <div className="grid grid-cols-4 gap-4">
              {defaultOptions.map((src, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAvatar(src)}
                  className={`rounded-full transition-all duration-200 ${selectedAvatar === src ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80'}`}
                >
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={src} />
                  </Avatar>
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePictureModal;