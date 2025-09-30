import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Vote, CheckCircle, XCircle, Clock, Users, PlusCircle, Send } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Navigate, Link } from 'react-router-dom';
import GardenParticles from '../components/GardenParticles';
import { useToast } from '../hooks/use-toast';
import { GovernanceProposal } from '../types';
import { supabase } from '../integrations/supabase/client';
import { aptos } from '../services/aptos';
import { CONTRACT_ADDRESS } from '../lib/constants';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const ProposalCard = ({ proposal }: { proposal: GovernanceProposal }) => {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const { toast } = useToast();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from('governance_discussions')
        .select('*')
        .eq('proposal_id', proposal.proposalId)
        .order('created_at', { ascending: false });
      if (data) setComments(data);
    };
    fetchComments();
  }, [proposal.proposalId]);

  const handleVote = async (inFavor: boolean) => {
    if (!connected) {
      toast({ title: "Please connect your wallet to vote.", variant: "destructive" });
      return;
    }
    const payload = {
      data: {
        function: `${CONTRACT_ADDRESS}::governance::vote` as `${string}::${string}::${string}`,
        functionArguments: [String(proposal.proposalId), inFavor],
      },
    };
    try {
      const response = await signAndSubmitTransaction(payload);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      toast({ title: "Vote Cast Successfully!" });
      // You would typically refetch proposal data here to update vote counts
    } catch (error) {
      console.error("Voting failed:", error);
      toast({ title: "Voting Failed", description: "Your vote could not be submitted.", variant: "destructive" });
    }
  };
  
  const handlePostComment = async () => {
    if (!newComment.trim() || !account?.address) return;
    setIsSubmittingComment(true);
    const { data, error } = await supabase.from('governance_discussions').insert({
      proposal_id: proposal.proposalId,
      author_address: account.address,
      comment: newComment,
    }).select();

    if (!error && data) {
      setComments([data[0], ...comments]);
      setNewComment('');
    } else {
        toast({ title: "Failed to post comment", variant: "destructive" });
    }
    setIsSubmittingComment(false);
  };

  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-garden p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-nunito font-bold text-foreground mb-2">#{proposal.proposalId}: {proposal.title}</h3>
          <p className="text-muted-foreground text-sm mb-3">{proposal.description}</p>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-4">
            <span>By {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
            <span className={`px-3 py-1 rounded-full capitalize ${ proposal.status === 'active' ? 'bg-primary/20 text-primary' : proposal.status === 'passed' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600' }`}>
              {proposal.status}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-green-600 flex items-center space-x-1"><CheckCircle className="w-4 h-4" /><span>For: {proposal.votesFor.toLocaleString()}</span></span>
          <span className="text-red-600 flex items-center space-x-1"><XCircle className="w-4 h-4" /><span>Against: {proposal.votesAgainst.toLocaleString()}</span></span>
        </div>
        <div className="w-full bg-border rounded-full h-3 overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${forPercentage}%` }}/></div>
        {proposal.status === 'active' && (
          <div className="flex space-x-4 pt-4">
            <Button onClick={() => handleVote(true)} className="flex-1 btn-garden-primary"><CheckCircle className="w-4 h-4 mr-2" />Vote For</Button>
            <Button onClick={() => handleVote(false)} className="flex-1 btn-garden-secondary"><XCircle className="w-4 h-4 mr-2" />Vote Against</Button>
          </div>
        )}
      </div>
      <div className="border-t border-border/50 mt-6 pt-6">
        <h4 className="text-lg font-nunito font-semibold mb-4">Discussion</h4>
        {connected && (
          <div className="flex gap-2 mb-4">
            <Textarea placeholder="Share your thoughts..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
            <Button onClick={handlePostComment} disabled={isSubmittingComment}><Send className="w-4 h-4"/></Button>
          </div>
        )}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {comments.length > 0 ? comments.map((comment) => (
            <div key={comment.id} className="bg-background/50 p-3 rounded-lg border border-border/50">
              <p className="text-sm text-foreground">{comment.comment}</p>
              <p className="text-xs text-muted-foreground mt-2">By: {comment.author_address.slice(0, 6)}...{comment.author_address.slice(-4)}</p>
            </div>
          )) : <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to share your thoughts!</p>}
        </div>
      </div>
    </motion.div>
  );
};

const Governance = () => {
  const { connected } = useWallet();
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'passed' | 'failed'>('all');

  useEffect(() => {
    const fetchProposals = async () => {
      setIsLoading(true);
      const { data: proposalRecords } = await supabase.from('proposals').select('proposal_id, proposer_address');

      if (!proposalRecords) {
        setIsLoading(false);
        return;
      }
      try {
        const proposalPromises = proposalRecords.map(async (record) => {
          const payload = {
            function: `${CONTRACT_ADDRESS}::governance::get_proposal` as `${string}::${string}::${string}`,
            functionArguments: [String(record.proposal_id)],
          };
          const onChainData = await aptos.view<[string, string, string, string, string, string]>({ payload });
          const [proposer, description, start, end, votes_for, votes_against] = onChainData;

          const now = Date.now() / 1000;
          const endTimestamp = parseInt(end);
          let status: 'active' | 'passed' | 'failed' = 'failed';
          if (now < endTimestamp) {
            status = 'active';
          } else if (parseInt(votes_for) > parseInt(votes_against)) {
            status = 'passed';
          }

          return {
            proposalId: record.proposal_id,
            title: description.split('\n')[0], // Simple title extraction
            description,
            proposer,
            status,
            votesFor: parseInt(votes_for),
            votesAgainst: parseInt(votes_against),
            endTimestamp: endTimestamp * 1000,
          } as GovernanceProposal;
        });

        const fetchedProposals = await Promise.all(proposalPromises);
        setProposals(fetchedProposals.sort((a, b) => b.proposalId - a.proposalId));
      } catch (error) {
        console.error("Failed to fetch on-chain proposal data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProposals();
  }, []);

  if (!connected) {
    return <Navigate to="/login" replace />;
  }
  
  const filteredProposals = proposals.filter(p => filter === 'all' || p.status === filter);

  return (
    <div className="relative min-h-screen py-8">
      <GardenParticles />
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Vote className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-5xl font-shadows text-foreground">Governance</h1>
          <p className="text-xl font-caveat text-primary">Shape the future of our platform</p>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Link to="/create-proposal">
            <Button className="btn-garden-primary"><PlusCircle className="w-4 h-4 mr-2"/>Create Proposal</Button>
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {(['all', 'active', 'passed', 'failed'] as const).map((f) => (
            <Button key={f} onClick={() => setFilter(f)} variant={filter === f ? 'default' : 'outline'} className="capitalize">{f} Proposals</Button>
          ))}
        </div>
        {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
        ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
                {filteredProposals.length > 0 ? (
                    filteredProposals.map((proposal) => <ProposalCard key={proposal.proposalId} proposal={proposal} />)
                ) : (
                    <div className="text-center py-12 card-garden">
                        <h3 className="text-2xl font-nunito font-bold">No proposals found</h3>
                        <p className="text-muted-foreground">Try selecting a different filter.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Governance;