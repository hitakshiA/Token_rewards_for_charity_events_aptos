// src/components/DonationModal.tsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { CharityEvent } from '../types';
import { formatAPT } from '../mockData';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { aptos } from '../services/aptos';
import { CONTRACT_ADDRESS } from '../lib/constants';
import { useToast } from '../hooks/use-toast';
import { getExplorerUrl } from '../lib/utils';
import { Button } from './ui/button';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CharityEvent | null;
  onSuccess?: (amount: number, heartTokens: number) => void;
}

type DonationStep = 'amount' | 'confirmation' | 'processing' | 'success';

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, event, onSuccess }) => {
  const { signAndSubmitTransaction } = useWallet();
  const { toast } = useToast();
  const [step, setStep] = useState<DonationStep>('amount');
  const [amount, setAmount] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [estimatedReward, setEstimatedReward] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>('');

  const quickAmounts = [1, 5, 10, 25, 50];

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    setEstimatedReward(Math.floor(numAmount * 2));
  }, [amount]);

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setAmount(value);
  };

  const handleNext = () => {
    if (step === 'amount' && parseFloat(amount) > 0) setStep('confirmation');
  };

  const handleConfirm = async () => {
    setStep('processing');
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0 || !event) return;

    const amountInOctas = Math.floor(numericAmount * 100_000_000);

    const donatePayload = {
      function: `${CONTRACT_ADDRESS}::charity::donate` as `${string}::${string}::${string}`,
      functionArguments: [event.eventAddress, String(amountInOctas)],
    };
    
    // For now, we are not batching the badge transaction to keep it simple.
    // We will just submit the donation.
    const transaction = {
      data: donatePayload
    };

    try {
      setProcessingStage('Please approve the transaction in your wallet...');
      const response = await signAndSubmitTransaction(transaction);
      
      setProcessingStage('Awaiting confirmation on the Aptos network...');
      await aptos.waitForTransaction({ transactionHash: response.hash });

      // --- THIS IS THE KEY CHANGE ---
      // The description now contains a clickable link.
      toast({
        title: "Donation Successful!",
        description: (
          <a 
            href={getExplorerUrl(response.hash, 'transaction')} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline text-primary hover:text-primary/80"
          >
            Your generosity has been recorded on the blockchain. Click to view.
          </a>
        ),
        duration: 9000, // Make toast stay longer so user can click
      });
      // --- END OF CHANGE ---

      setStep('success');
      onSuccess?.(numericAmount, estimatedReward);
    } catch (error) {
      console.error("Donation failed:", error);
      toast({
        title: "Donation Failed",
        description: "Transaction was rejected or failed. Please try again.",
        variant: "destructive",
      });
      setStep('confirmation');
    }
  };
  
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('amount');
      setAmount('');
      setCustomAmount('');
    }, 300);
  };

  if (!event) return null;

  return (
     <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 50, rotateX: 20, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30, rotateX: -10 }}
            transition={{ type: "spring", damping: 20, stiffness: 280, duration: 0.6 }}
            className="relative w-full max-w-md bg-card rounded-3xl shadow-[var(--shadow-garden)] border border-border overflow-hidden backdrop-blur-sm"
            style={{ transformStyle: "preserve-3d" }}
          >
            <button onClick={handleClose} className="absolute top-4 right-4 z-10 p-2 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
            <AnimatePresence mode="wait">
              {step === 'amount' && (
                <motion.div key="amount" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }} className="p-6 space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-shadows text-foreground mb-2">Plant a Seed of Hope</h2>
                    <p className="text-sm text-muted-foreground">for {event.eventName}</p>
                  </div>
                   <div className="grid grid-cols-5 gap-3">
                    {quickAmounts.map(value => (
                      <motion.button key={value} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => handleAmountSelect(value)} className={`p-3 rounded-xl border-2 transition-all ${ amount === value.toString() ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50' }`}>
                        <div className="font-nunito font-semibold">{value}</div>
                      </motion.button>
                    ))}
                  </div>
                  <div className="relative">
                    <input type="number" placeholder="Custom amount..." value={customAmount} onChange={(e) => handleCustomAmountChange(e.target.value)} className="w-full p-4 bg-background border border-border rounded-xl text-center text-lg font-nunito font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">APT</span>
                  </div>
                   {estimatedReward > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">You'll receive:</span>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4 text-primary" fill="currentColor" />
                          <span className="font-caveat text-lg font-semibold text-primary">{estimatedReward} HEART tokens</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <Button onClick={handleNext} disabled={!amount || parseFloat(amount) <= 0} className="w-full btn-garden-primary">
                    Continue
                  </Button>
                </motion.div>
              )}
              {step === 'confirmation' && (
                 <motion.div key="confirmation" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="p-6 space-y-6">
                   <h2 className="text-2xl font-shadows text-foreground text-center">Confirm Your Donation</h2>
                   <div className="card-garden p-4 space-y-3">
                    <div className="flex justify-between items-center"><span className="text-muted-foreground">Campaign:</span><span className="font-nunito font-semibold text-right max-w-[60%] truncate">{event.eventName}</span></div>
                    <div className="flex justify-between items-center"><span className="text-muted-foreground">Amount:</span><span className="font-nunito font-bold text-xl text-primary">{formatAPT(parseFloat(amount))} APT</span></div>
                    <div className="flex justify-between items-center"><span className="text-muted-foreground">HEART Reward:</span><span className="font-caveat text-lg font-semibold text-primary">{estimatedReward} ❤️</span></div>
                  </div>
                   <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => setStep('amount')} className="flex-1 btn-garden-secondary">Back</Button>
                    <Button onClick={handleConfirm} className="flex-1 btn-garden-primary">Confirm & Donate</Button>
                   </div>
                 </motion.div>
              )}
              {step === 'processing' && (
                <motion.div key="processing" className="p-8 text-center space-y-4">
                  <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                  <h2 className="text-xl font-nunito font-bold">Processing Donation...</h2>
                  <p className="text-muted-foreground text-sm">{processingStage}</p>
                </motion.div>
              )}
              {step === 'success' && (
                 <motion.div key="success" className="p-8 text-center space-y-4">
                   <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                   <h2 className="text-3xl font-shadows text-primary">Thank You!</h2>
                   <p className="text-muted-foreground">Your donation has been successfully recorded.</p>
                   <div className="card-garden p-4">
                    <p className="font-nunito font-semibold">You've earned {estimatedReward} HEART tokens!</p>
                  </div>
                   <Button onClick={handleClose} className="w-full btn-garden-primary">Done</Button>
                 </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DonationModal;