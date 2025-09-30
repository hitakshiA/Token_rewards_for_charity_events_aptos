// src/pages/Badges.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, Loader2 } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Navigate } from 'react-router-dom';
import GardenParticles from '../components/GardenParticles';
import { NFTCertificate } from '@/types';
import { aptos } from '@/services/aptos';
import { CONTRACT_ADDRESS } from '@/lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const Badges = () => {
  const { connected, account } = useWallet();
  const [badges, setBadges] = useState<NFTCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<NFTCertificate | null>(null);

  useEffect(() => {
    if (!account?.address) {
      setIsLoading(false);
      return;
    }
    const fetchBadges = async () => {
      setIsLoading(true);
      try {
        const payload = {
          function: `${CONTRACT_ADDRESS}::badges::get_donor_nfts` as `${string}::${string}::${string}`,
          functionArguments: [account.address],
        };
        const onChainBadges = await aptos.view<any[]>(payload);

        // Transform on-chain data into the format our UI expects
        const formattedBadges: NFTCertificate[] = onChainBadges[0].map((badge: any, index: number) => ({
          tokenId: `${badge.campaign_id}-${index}`,
          name: badge.token_name,
          description: `Tier ${badge.tier} supporter badge for a campaign.`, // Description is not stored on-chain
          imageUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${badge.token_name}`, // Generate a unique avatar
          dateEarned: new Date(parseInt(badge.received_at) * 1000).toISOString(),
        }));
        setBadges(formattedBadges);
      } catch (error) {
        console.error("Failed to fetch badges:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBadges();
  }, [account]);

  if (!connected) return <Navigate to="/login" replace />;

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;
  }
  
  return (
    <>
      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        {/* ... Dialog content from previous step ... */}
      </Dialog>
      <div className="relative min-h-screen py-8">
        <GardenParticles />
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
             <Award className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-5xl font-shadows text-foreground">My Badges</h1>
            <p className="text-xl font-caveat text-primary">Your collection of achievements</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.length > 0 ? badges.map((badge, index) => (
              <motion.div
                key={badge.tokenId}
                onClick={() => setSelectedBadge(badge)}
                className="card-garden p-6 text-center space-y-4 cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <img src={badge.imageUrl} alt={badge.name} className="w-24 h-24 mx-auto rounded-full bg-background/50 border-2 border-primary/20"/>
                <div>
                  <h3 className="font-nunito font-bold text-foreground mb-1">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                  <p className="text-xs text-primary font-caveat mt-2">Earned {new Date(badge.dateEarned).toLocaleDateString()}</p>
                </div>
              </motion.div>
            )) : <p className="col-span-full text-center text-muted-foreground py-12">You haven't earned any badges yet. Make a donation to start your collection!</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Badges;