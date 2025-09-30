module charity_addr::governance {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_std::smart_table::{Self, SmartTable};
    use charity_addr::staking;

    // Error constants with documentation comments
    /// Proposal with this ID already exists
    const EPROPOSAL_ALREADY_EXISTS: u64 = 1;
    /// Proposal with this ID does not exist
    const EPROPOSAL_DOES_NOT_EXIST: u64 = 2;
    /// Voting period for this proposal has ended
    const EPROPOSAL_VOTING_CLOSED: u64 = 3;
    /// User has already voted on this proposal
    const EALREADY_VOTED: u64 = 4;
    /// User has no voting power (no staked tokens)
    const ENO_VOTING_POWER: u64 = 5;
    /// Governance system not initialized
    const EGOVERNANCE_NOT_INITIALIZED: u64 = 6;

    struct Proposal has store, drop {
        proposer: address,
        description: String,
        voting_starts_secs: u64,
        voting_ends_secs: u64,
        votes_for: u64,
        votes_against: u64,
        voters: vector<address>,
    }

    struct Governance has key {
        proposals: SmartTable<u64, Proposal>,
        proposal_count: u64,
    }

    #[event]
    struct ProposalCreated has drop, store {
        proposal_id: u64,
        proposer: address,
        description: String,
        voting_starts_secs: u64,
        voting_ends_secs: u64,
        proposer_voting_power: u64,
        created_at: u64,
    }

    #[event]
    struct VoteCast has drop, store {
        proposal_id: u64,
        voter: address,
        in_favor: bool,
        voting_power: u64,
        total_votes_for: u64,
        total_votes_against: u64,
        voted_at: u64,
    }

    #[event]
    struct ProposalExecuted has drop, store {
        proposal_id: u64,
        executor: address,
        passed: bool,
        final_votes_for: u64,
        final_votes_against: u64,
        executed_at: u64,
    }

    public entry fun initialize_governance(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<Governance>(admin_addr), EGOVERNANCE_NOT_INITIALIZED);

        move_to(admin, Governance {
            proposals: smart_table::new(),
            proposal_count: 0,
        });
    }

    public entry fun create_proposal(
        proposer: &signer,
        description: String,
        duration_secs: u64,
    ) acquires Governance {
        let proposer_addr = signer::address_of(proposer);
        
        // Check if proposer has voting power (staked tokens)
        let voting_power = staking::get_voting_power(proposer_addr);
        assert!(voting_power > 0, ENO_VOTING_POWER);

        assert!(exists<Governance>(@charity_addr), EGOVERNANCE_NOT_INITIALIZED);
        let governance = borrow_global_mut<Governance>(@charity_addr);
        let proposal_id = governance.proposal_count;
        let now = timestamp::now_seconds();

        let new_proposal = Proposal {
            proposer: proposer_addr,
            description,
            voting_starts_secs: now,
            voting_ends_secs: now + duration_secs,
            votes_for: 0,
            votes_against: 0,
            voters: vector::empty(),
        };

        governance.proposals.add(proposal_id, new_proposal);
        governance.proposal_count += 1;

        // Emit proposal creation event
        event::emit(ProposalCreated {
            proposal_id,
            proposer: proposer_addr,
            description,
            voting_starts_secs: now,
            voting_ends_secs: now + duration_secs,
            proposer_voting_power: voting_power,
            created_at: now,
        });
    }

    public entry fun vote(
        voter: &signer,
        proposal_id: u64,
        in_favor: bool,
    ) acquires Governance {
        let voter_addr = signer::address_of(voter);
        
        // Check if voter has voting power (staked tokens)
        let voting_power = staking::get_voting_power(voter_addr);
        assert!(voting_power > 0, ENO_VOTING_POWER);

        assert!(exists<Governance>(@charity_addr), EGOVERNANCE_NOT_INITIALIZED);
        let governance = borrow_global_mut<Governance>(@charity_addr);
        
        assert!(governance.proposals.contains(proposal_id), EPROPOSAL_DOES_NOT_EXIST);
        let proposal = governance.proposals.borrow_mut(proposal_id);

        assert!(timestamp::now_seconds() < proposal.voting_ends_secs, EPROPOSAL_VOTING_CLOSED);

        // Check if voter has already voted
        let i = 0;
        let voters_len = proposal.voters.length();
        while (i < voters_len) {
            let addr = proposal.voters[i];
            assert!(addr != voter_addr, EALREADY_VOTED);
            i += 1;
        };

        proposal.voters.push_back(voter_addr);

        if (in_favor) {
            proposal.votes_for += voting_power;
        } else {
            proposal.votes_against += voting_power;
        };

        // Emit vote cast event
        event::emit(VoteCast {
            proposal_id,
            voter: voter_addr,
            in_favor,
            voting_power,
            total_votes_for: proposal.votes_for,
            total_votes_against: proposal.votes_against,
            voted_at: timestamp::now_seconds(),
        });
    }

    // Additional utility functions for better governance
    public entry fun execute_proposal(
        executor: &signer,
        proposal_id: u64,
    ) acquires Governance {
        let executor_addr = signer::address_of(executor);
        
        assert!(exists<Governance>(@charity_addr), EGOVERNANCE_NOT_INITIALIZED);
        let governance = borrow_global<Governance>(@charity_addr);
        
        assert!(governance.proposals.contains(proposal_id), EPROPOSAL_DOES_NOT_EXIST);
        let proposal = governance.proposals.borrow(proposal_id);

        // Check if voting period has ended
        assert!(timestamp::now_seconds() >= proposal.voting_ends_secs, EPROPOSAL_VOTING_CLOSED);
        
        // Check if proposal passed (simple majority)
        let passed = proposal.votes_for > proposal.votes_against;
        assert!(passed, EPROPOSAL_DOES_NOT_EXIST); // Reusing error code for "failed"
        
        // Emit proposal execution event
        event::emit(ProposalExecuted {
            proposal_id,
            executor: executor_addr,
            passed,
            final_votes_for: proposal.votes_for,
            final_votes_against: proposal.votes_against,
            executed_at: timestamp::now_seconds(),
        });
        
        // In a real implementation, you would execute the actual proposal logic here
        // For now, this just validates that the proposal can be executed
    }

    #[view]
    public fun get_proposal(proposal_id: u64): (address, String, u64, u64, u64, u64) acquires Governance {
        assert!(exists<Governance>(@charity_addr), EGOVERNANCE_NOT_INITIALIZED);
        let governance = borrow_global<Governance>(@charity_addr);
        
        assert!(governance.proposals.contains(proposal_id), EPROPOSAL_DOES_NOT_EXIST);
        let proposal = governance.proposals.borrow(proposal_id);
        
        (
            proposal.proposer,
            proposal.description,
            proposal.voting_starts_secs,
            proposal.voting_ends_secs,
            proposal.votes_for,
            proposal.votes_against
        )
    }

    #[view]
    public fun get_proposal_count(): u64 acquires Governance {
        if (!exists<Governance>(@charity_addr)) {
            return 0
        };
        let governance = borrow_global<Governance>(@charity_addr);
        governance.proposal_count
    }

    #[view]
    public fun has_voted(proposal_id: u64, voter_addr: address): bool acquires Governance {
        if (!exists<Governance>(@charity_addr)) {
            return false
        };
        let governance = borrow_global<Governance>(@charity_addr);
        
        if (!governance.proposals.contains(proposal_id)) {
            return false
        };
        
        let proposal = governance.proposals.borrow(proposal_id);
        let i = 0;
        let voters_len = proposal.voters.length();
        while (i < voters_len) {
            let addr = proposal.voters[i];
            if (addr == voter_addr) {
                return true
            };
            i += 1;
        };
        false
    }

    #[view]
    public fun is_proposal_active(proposal_id: u64): bool acquires Governance {
        if (!exists<Governance>(@charity_addr)) {
            return false
        };
        let governance = borrow_global<Governance>(@charity_addr);
        
        if (!governance.proposals.contains(proposal_id)) {
            return false
        };
        
        let proposal = governance.proposals.borrow(proposal_id);
        let now = timestamp::now_seconds();
        now >= proposal.voting_starts_secs && now < proposal.voting_ends_secs
    }

    #[view]
    public fun get_proposal_result(proposal_id: u64): (bool, u64, u64) acquires Governance {
        assert!(exists<Governance>(@charity_addr), EGOVERNANCE_NOT_INITIALIZED);
        let governance = borrow_global<Governance>(@charity_addr);
        
        assert!(governance.proposals.contains(proposal_id), EPROPOSAL_DOES_NOT_EXIST);
        let proposal = governance.proposals.borrow(proposal_id);
        
        let passed = proposal.votes_for > proposal.votes_against;
        (passed, proposal.votes_for, proposal.votes_against)
    }
}