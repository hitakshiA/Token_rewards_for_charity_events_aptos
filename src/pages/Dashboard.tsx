// src/pages/Dashboard.tsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trophy, TrendingUp, Calendar, Edit, Save, Loader2 } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Navigate } from 'react-router-dom';
import GardenParticles from '../components/GardenParticles';
import UserAvatar from '../components/UserAvatar';
import ProfilePictureModal from '../components/ProfilePictureModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { DonorProfile } from '@/types';
import { aptos } from '@/services/aptos';
import { CONTRACT_ADDRESS } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { LIVE_CAMPAIGNS } from '@/lib/campaigns';

const Dashboard = () => {
  const { connected, account } = useWallet();
  const [profile, setProfile] = useState<Partial<DonorProfile>>({});
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    if (!connected || !account?.address) {
      setIsLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      const userAddress = account.address.toString();

      try {
        // --- Perform all data fetches in parallel ---
        const [
          heartBalance,
          stakedPosition,
          donorNfts,
          donationHistory,
          allCampaignsResponse
        ] = await Promise.all([
          aptos.view<[string]>({ payload: { function: `${CONTRACT_ADDRESS}::charity::get_heart_balance`, functionArguments: [userAddress] } }),
          aptos.view<[string, string]>({ payload: { function: `${CONTRACT_ADDRESS}::staking::get_staked_position`, functionArguments: [userAddress] } }),
          aptos.view<any[]>({ payload: { function: `${CONTRACT_ADDRESS}::badges::get_donor_nfts`, functionArguments: [userAddress] } }),
          supabase.from('donations').select('*, campaigns(object_address)').eq('donor_address', userAddress).order('created_at', { ascending: false }).limit(3),
          supabase.from('campaigns').select('object_address')
        ]);

        // --- Process donation totals ---
        let totalDonatedAPT = 0;
        let donationCount = 0;
        if (allCampaignsResponse.data) {
          const donationPromises = allCampaignsResponse.data.map(campaign => 
            aptos.view<[string]>({ payload: { function: `${CONTRACT_ADDRESS}::badges::get_donor_donation_total`, functionArguments: [userAddress, campaign.object_address] } })
          );
          const donationResults = await Promise.all(donationPromises);
          donationResults.forEach(res => {
            const amount = parseInt(res[0]);
            if (amount > 0) {
              totalDonatedAPT += amount / 100_000_000;
              donationCount++;
            }
          });
        }
        
        // --- Set Profile State ---
        setProfile({
          heartTokens: parseInt(heartBalance[0]),
          stakedHeartTokens: parseInt(stakedPosition[0]),
          nftBadges: donorNfts[0] || [],
          totalDonatedAPT: totalDonatedAPT,
          donationCount: donationCount,
        });

        // --- Set Recent Donations State ---
        if (donationHistory.data) {
           const donationsWithCampaignNames = donationHistory.data.map(donation => {
                const campaignMeta = LIVE_CAMPAIGNS.find(c => c.eventAddress === donation.campaign_address);
                return {
                    ...donation,
                    campaignName: campaignMeta ? campaignMeta.summary : 'A Campaign',
                };
            });
            setRecentDonations(donationsWithCampaignNames);
        }

        // --- Set Display Name State ---
        const storageKey = `displayName_${userAddress}`;
        const savedName = localStorage.getItem(storageKey);
        const name = savedName || account.ansName || `${userAddress.slice(0, 6)}...`;
        setDisplayName(name);
        setTempName(name);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [account, connected]);
  
  if (!connected || !account) {
    return <Navigate to="/login" replace />;
  }
  
  // --- All other functions (handleSaveAvatar, handleSaveName) are the same as before ---
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;
  }

  return (
    <>
      {/* ... ProfilePictureModal JSX is the same ... */}
      <div className="relative min-h-screen py-8">
        <GardenParticles />
        <div className="container mx-auto px-4">
          {/* ... Avatar and Name editing JSX is the same ... */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <div className="card-garden p-3 md:p-6 text-center"><Heart className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-3" /><div className="text-lg md:text-2xl font-nunito font-bold">{profile.totalDonatedAPT?.toFixed(2) || '0.00'} APT</div><div className="text-xs md:text-sm text-muted-foreground">Total Donated</div></div>
            <div className="card-garden p-3 md:p-6 text-center"><Trophy className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-3" /><div className="text-lg md:text-2xl font-nunito font-bold">{profile.donationCount || 0}</div><div className="text-xs md:text-sm text-muted-foreground">Campaigns Supported</div></div>
            <div className="card-garden p-3 md:p-6 text-center"><Heart className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-3" fill="currentColor" /><div className="text-lg md:text-2xl font-nunito font-bold">{profile.heartTokens || 0}</div><div className="text-xs md:text-sm text-muted-foreground">HEART Tokens</div></div>
            <div className="card-garden p-3 md:p-6 text-center"><TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-3" /><div className="text-lg md:text-2xl font-nunito font-bold">{profile.stakedHeartTokens || 0}</div><div className="text-xs md:text-sm text-muted-foreground">Staked HEART</div></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="grid lg:grid-cols-2 gap-4 md:gap-8">
            <div className="card-garden p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-nunito font-bold text-foreground mb-4 md:mb-6">Recent Donation History</h2>
              <div className="space-y-4">
                {recentDonations.length > 0 ? recentDonations.map((donation, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + index * 0.1 }} className="flex justify-between items-center p-3 md:p-4 bg-background rounded-xl border border-border">
                    <div>
                      <p className="font-nunito font-semibold text-foreground text-sm md:text-base">{donation.campaignName}</p>
                      <p className="text-xs md:text-sm text-muted-foreground"><Calendar className="w-3 h-3 inline mr-1" />{new Date(donation.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-nunito font-bold text-primary text-sm md:text-base">{(donation.amount / 100_000_000).toFixed(2)} APT</p>
                      <p className="text-xs text-muted-foreground">+{donation.heart_tokens_minted} HEART</p>
                    </div>
                  </motion.div>
                )) : <p className="text-center text-muted-foreground">No donation history found.</p>}
              </div>
            </div>
            {/* ... Your Impact Metrics section ... */}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;