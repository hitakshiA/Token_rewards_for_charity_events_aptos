// src/pages/Staking.tsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, TrendingUp, Clock, Zap, Loader2 } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Navigate } from 'react-router-dom';
import GardenParticles from '../components/GardenParticles';
import { useToast } from '../hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { aptos } from '@/services/aptos';
import { CONTRACT_ADDRESS } from '@/lib/constants';
import { getExplorerUrl } from '@/lib/utils';

const Staking = () => {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const { toast } = useToast();
  const [stakingAmount, setStakingAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stakingData, setStakingData] = useState({
    heartTokens: 0,
    stakedHeartTokens: 0,
    stakingAPY: 12.5, 
    pendingRewards: 0,
    daysStaked: 0,
  });

  const fetchData = async () => {
    if (!account?.address) return;
    try {
      const [heartBalance, stakedPosition, poolInfo] = await Promise.all([
        aptos.view<[string]>({ payload: { function: `${CONTRACT_ADDRESS}::charity::get_heart_balance`, functionArguments: [account.address] } }),
        aptos.view<[string, string, string]>({ payload: { function: `${CONTRACT_ADDRESS}::staking::get_staked_position`, functionArguments: [account.address] } }),
        aptos.view<[string, string]>({ payload: { function: `${CONTRACT_ADDRESS}::staking::get_pool_info` } }),
      ]);
      
      const stakedAtTimestamp = parseInt(stakedPosition[2]);
      const daysStaked = stakedAtTimestamp > 0 ? Math.floor((Date.now() / 1000 - stakedAtTimestamp) / (60 * 60 * 24)) : 0;
      const calculatedApy = 12.5; 

      setStakingData({
        heartTokens: parseInt(heartBalance[0]),
        stakedHeartTokens: parseInt(stakedPosition[0]),
        pendingRewards: parseInt(stakedPosition[1]),
        stakingAPY: calculatedApy,
        daysStaked: daysStaked,
      });
    } catch (error) {
      console.error("Failed to fetch staking data:", error);
      toast({ title: "Error", description: "Could not fetch staking data from the blockchain.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (connected && account?.address) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [account, connected]);

  if (!connected || !account) {
    return <Navigate to="/login" replace />;
  }

  const handleTransaction = async (action: 'stake' | 'unstake' | 'claim_rewards') => {
    setIsSubmitting(true);
    let payload;

    switch (action) {
      case 'stake':
        const amount = parseInt(stakingAmount);
        if (!amount || amount <= 0) {
          toast({ title: "Invalid Amount", variant: "destructive" });
          setIsSubmitting(false);
          return;
        }
        payload = { data: { function: `${CONTRACT_ADDRESS}::staking::stake`, functionArguments: [String(amount)] } };
        break;
      case 'unstake':
        payload = { data: { function: `${CONTRACT_ADDRESS}::staking::unstake`, functionArguments: [] } };
        break;
      case 'claim_rewards':
        payload = { data: { function: `${CONTRACT_ADDRESS}::staking::claim_rewards`, functionArguments: [] } };
        break;
      default:
        setIsSubmitting(false);
        return;
    }

    try {
      const response = await signAndSubmitTransaction(payload as any);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      toast({ 
        title: `Transaction Successful!`, 
        description: <a href={getExplorerUrl(response.hash, 'transaction')} target="_blank" rel="noopener noreferrer" className="underline">View on Explorer</a>
      });
      fetchData(); // Refresh data after successful transaction
    } catch (error) {
      toast({ title: `${action.replace('_', ' ')} Failed`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableToStake = stakingData.heartTokens;

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;
  }
  
  return (
    <div className="relative min-h-screen py-8">
      <GardenParticles />
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-5xl font-shadows text-foreground">HEART Staking</h1>
          <p className="text-xl font-caveat text-primary">Stake your HEART to earn rewards and voting power</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card-garden p-6 text-center"><Lock className="w-8 h-8 text-primary mx-auto mb-3" fill="currentColor" /><div className="text-2xl font-nunito font-bold">{stakingData.stakedHeartTokens}</div><div className="text-sm text-muted-foreground">Staked HEART</div></div>
          <div className="card-garden p-6 text-center"><TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" /><div className="text-2xl font-nunito font-bold">{stakingData.stakingAPY}%</div><div className="text-sm text-muted-foreground">Current APY</div></div>
          <div className="card-garden p-6 text-center"><Zap className="w-8 h-8 text-primary mx-auto mb-3" /><div className="text-2xl font-nunito font-bold">{stakingData.pendingRewards.toFixed(2)}</div><div className="text-sm text-muted-foreground">Pending Rewards</div></div>
          <div className="card-garden p-6 text-center"><Clock className="w-8 h-8 text-primary mx-auto mb-3" /><div className="text-2xl font-nunito font-bold">{stakingData.daysStaked}</div><div className="text-sm text-muted-foreground">Days Staked</div></div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
            <div className="card-garden p-6">
              <h3 className="text-2xl font-nunito font-bold text-foreground mb-6">Stake HEART Tokens</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-nunito font-medium text-foreground mb-2">Amount to Stake</label>
                  <Input type="number" placeholder="0" value={stakingAmount} onChange={(e) => setStakingAmount(e.target.value)} max={availableToStake} className="w-full p-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg" />
                  <p className="text-xs text-muted-foreground mt-1">Available: {availableToStake} HEART</p>
                </div>
                <Button onClick={() => handleTransaction('stake')} disabled={isSubmitting || !stakingAmount || parseFloat(stakingAmount) <= 0} className="w-full btn-garden-primary">{isSubmitting ? <Loader2 className="animate-spin" /> : "Stake Tokens"}</Button>
              </div>
            </div>
            <div className="card-garden p-6 bg-primary/5 border-primary/20">
              <h4 className="text-lg font-nunito font-semibold text-foreground mb-4">Staking Benefits</h4>
                <p className="text-sm text-muted-foreground">• Earn {stakingData.stakingAPY}% APY on staked tokens</p>
                <p className="text-sm text-muted-foreground">• 1.2x multiplier on future donation rewards</p>
                <p className="text-sm text-muted-foreground">• Voting power in governance proposals</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
            <div className="card-garden p-6">
              <h3 className="text-2xl font-nunito font-bold text-foreground mb-6">Your Staking Position</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-background rounded-xl"><span className="text-muted-foreground">Staked Amount</span><span className="font-nunito font-bold text-primary text-lg">{stakingData.stakedHeartTokens} HEART</span></div>
                <div className="flex justify-between items-center p-4 bg-background rounded-xl"><span className="text-muted-foreground">Pending Rewards</span><span className="font-nunito font-bold text-primary text-lg">{stakingData.pendingRewards.toFixed(2)} HEART</span></div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Button onClick={() => handleTransaction('claim_rewards')} disabled={isSubmitting || stakingData.pendingRewards <= 0} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl">{isSubmitting ? <Loader2 className="animate-spin"/> : "Claim Rewards"}</Button>
                  <Button onClick={() => handleTransaction('unstake')} disabled={isSubmitting || stakingData.stakedHeartTokens <= 0} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl">{isSubmitting ? <Loader2 className="animate-spin"/> : "Unstake"}</Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Staking;