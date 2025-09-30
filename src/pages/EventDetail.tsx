// src/pages/EventDetail.tsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Heart, Loader2, ArrowLeft, Share, Sparkles, Target } from 'lucide-react';
import { CharityEvent } from '../types';
import { getTimeRemaining, formatAPT, calculateProgress } from '../lib/utils';
import DonationModal from '../components/DonationModal';
import GardenParticles from '../components/GardenParticles';
import { aptos } from '../services/aptos';
import { CONTRACT_ADDRESS } from '../lib/constants';
import { LIVE_CAMPAIGNS } from '../lib/campaigns';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const EventDetail = () => {
  const { eventAddress } = useParams<{ eventAddress: string }>();
  const [event, setEvent] = useState<CharityEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [stickyDonation, setStickyDonation] = useState(false);

  const fetchEventDetails = async () => {
    if (!eventAddress) {
      setIsLoading(false);
      return;
    }
    
    try {
      const [campaignMeta, onChainData, donationHistory] = await Promise.all([
        LIVE_CAMPAIGNS.find(c => c.eventAddress === eventAddress),
        aptos.view<[string, string, string, string, string]>({ payload: { function: `${CONTRACT_ADDRESS}::charity::get_campaign_info`, functionArguments: [eventAddress] } }),
        supabase.from('donations').select('*').eq('campaign_address', eventAddress).order('created_at', { ascending: false }).limit(5)
      ]);

      if (!campaignMeta) throw new Error("Metadata not found.");

      const [_creator, onChainDescription, goal_amount, end_timestamp_secs, total_donated] = onChainData;
      
      const completeEvent: CharityEvent = {
        ...campaignMeta,
        eventName: onChainDescription,
        goalAmount: parseInt(goal_amount) / 100_000_000,
        totalDonated: parseInt(total_donated) / 100_000_000,
        endTimestamp: parseInt(end_timestamp_secs) * 1000,
      };

      setEvent(completeEvent);
      if (donationHistory.data) setRecentDonations(donationHistory.data);

    } catch (error) {
      console.error("Failed to fetch event details:", error);
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchEventDetails();
  }, [eventAddress]);

  useEffect(() => {
    const handleScroll = () => setStickyDonation(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDonationSuccess = (amount: number, heartTokens: number) => {
    fetchEventDetails(); // The simplest way to get all fresh data
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-nunito font-bold mb-2">Campaign Not Found</h2>
          <p className="text-muted-foreground mb-6">The campaign address is invalid or data could not be loaded.</p>
          <Link to="/marketplace" className="btn-garden-primary">Browse Campaigns</Link>
        </div>
      </div>
    );
  }
  
  const progress = calculateProgress(event.totalDonated, event.goalAmount);
  const timeRemaining = getTimeRemaining(event.endTimestamp);

  return (
    <div className="relative min-h-screen">
      <GardenParticles />
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link to="/marketplace" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" /><span>Back to Marketplace</span>
          </Link>
        </motion.div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl overflow-hidden">
              <img src={event.imageUrl} alt={event.eventName} className="w-full h-64 md:h-80 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h1 className="text-3xl md:text-4xl font-shadows mb-2">{event.eventName}</h1>
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-primary rounded-full text-sm font-nunito font-medium">{event.charityName}</span>
                  <div className="flex items-center space-x-1 text-sm"><Clock className="w-4 h-4" /><span>{timeRemaining}</span></div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-garden p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-nunito font-bold text-primary">{Math.round(progress)}% funded</span>
                <span className="text-lg text-muted-foreground">{formatAPT(event.totalDonated)} / {formatAPT(event.goalAmount)} APT</span>
              </div>
              <div className="progress-vine"><motion.div className="progress-vine-fill" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5, ease: "easeOut" }} /></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-garden p-6">
              <h2 className="text-2xl font-nunito font-bold text-foreground mb-4">About This Campaign</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground">{event.description}</div>
            </motion.div>
          </div>
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`card-garden p-6 lg:sticky lg:top-24`}>
              <h3 className="text-xl font-nunito font-bold text-foreground mb-4">Make Your Impact</h3>
              <Button onClick={() => setDonationModalOpen(true)} className="w-full btn-garden-primary text-lg">
                <Heart className="w-5 h-5 mr-2" />Donate Now
              </Button>
            </motion.div>
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-garden p-6">
              <h3 className="text-lg font-nunito font-bold text-foreground mb-4">Recent Donations</h3>
              <div className="space-y-3">
                <AnimatePresence>
                  {recentDonations.length > 0 ? recentDonations.map((donation) => (
                    <motion.div key={donation.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex justify-between items-center p-3 bg-background rounded-xl">
                      <div>
                        <p className="font-caveat text-lg font-semibold text-primary">{donation.donor_address.slice(0, 6)}...{donation.donor_address.slice(-4)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(donation.created_at).toLocaleTimeString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-nunito font-semibold">{formatAPT(donation.amount / 100_000_000)} APT</p>
                        <p className="text-xs text-primary">planted a seed 🌱</p>
                      </div>
                    </motion.div>
                  )) : <p className="text-center text-muted-foreground text-sm py-4">Be the first to support this cause!</p>}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <DonationModal isOpen={donationModalOpen} onClose={() => setDonationModalOpen(false)} event={event} onSuccess={handleDonationSuccess} />
    </div>
  );
};

export default EventDetail;