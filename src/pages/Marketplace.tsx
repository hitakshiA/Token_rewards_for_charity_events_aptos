// src/pages/Marketplace.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Loader2, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import GSAPMarketplace from '../components/GSAPMarketplace';
import GardenParticles from '../components/GardenParticles';
import { CharityEvent } from '../types';
import { aptos } from '../services/aptos';
import { CONTRACT_ADDRESS } from '../lib/constants';
import { supabase } from '../integrations/supabase/client';
import { LIVE_CAMPAIGNS } from '../lib/campaigns'; // We still use this for static metadata

const Marketplace = () => {
  const [events, setEvents] = useState<CharityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'progress' | 'recent' | 'ending'>('progress');

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      
      // 1. Fetch the list of campaign addresses from Supabase
      const { data: campaignRecords, error: dbError } = await supabase
        .from('campaigns')
        .select('object_address');

      if (dbError || !campaignRecords) {
        console.error("Failed to fetch campaigns from DB:", dbError);
        setIsLoading(false);
        return;
      }
      
      try {
        const campaignPromises = campaignRecords.map(async (record) => {
          const functionName = `${CONTRACT_ADDRESS}::charity::get_campaign_info` as `${string}::${string}::${string}`;
          const payload = { function: functionName, functionArguments: [record.object_address] };
          const onChainData = await aptos.view<[string, string, string, string, string]>({ payload });
          const [_creator, onChainDescription, goal_amount, end_timestamp_secs, total_donated] = onChainData;

          // Find the matching static data (like image and summary)
          const campaignMeta = LIVE_CAMPAIGNS.find(c => c.eventAddress === record.object_address);
          if (!campaignMeta) return null; // Skip if no metadata found

          return {
            ...campaignMeta,
            eventName: onChainDescription,
            goalAmount: parseInt(goal_amount) / 100_000_000,
            totalDonated: parseInt(total_donated) / 100_000_000,
            endTimestamp: parseInt(end_timestamp_secs) * 1000,
          } as CharityEvent;
        });

        const fetchedEvents = (await Promise.all(campaignPromises)).filter(Boolean) as CharityEvent[];
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to fetch on-chain campaign data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const filteredEvents = events.filter(event => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return (
      event.eventName.toLowerCase().includes(lowercasedSearchTerm) ||
      event.charityName.toLowerCase().includes(lowercasedSearchTerm) ||
      event.summary.toLowerCase().includes(lowercasedSearchTerm)
    );
  }).sort((a, b) => { /* ... sorting logic ... */ });

  return (
    <div className="relative min-h-screen py-8">
      <GardenParticles />
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-6xl lg:text-7xl font-shadows text-foreground mb-6">The Garden of Causes</h1>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Discover meaningful campaigns and earn HEART tokens. Transform your compassion into Heart NFTs that celebrate your generosity.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-garden p-8 mb-12">
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full md:max-w-lg">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="text" placeholder="Search causes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg" />
                </div>
                <div className="flex items-center space-x-3">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-background border border-border rounded-full px-6 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <option value="progress">Most Funded</option>
                        <option value="recent">Recently Added</option>
                        <option value="ending">Ending Soon</option>
                    </select>
                </div>
                <Link to="/create-campaign" className="btn-garden-primary !px-6 !py-3 !text-base">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Create Campaign
                </Link>
            </div>
        </motion.div>
        {/* ... Loading and Rendering Logic from previous steps ... */}
      </div>
    </div>
  );
};

export default Marketplace;