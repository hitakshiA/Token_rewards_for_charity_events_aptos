module charity_addr::staking {
    use std::signer;
    use aptos_framework::timestamp;
    use aptos_framework::event;

    use charity_addr::charity;

    /// Pool is already initialized
    const EPOOL_ALREADY_INITIALIZED: u64 = 1;
    /// Pool is not initialized
    const EPOOL_NOT_INITIALIZED: u64 = 2;
    /// Cannot stake zero amount
    const EZERO_AMOUNT_STAKED: u64 = 3;
    /// User has already staked
    const EALREADY_STAKED: u64 = 4;
    /// User has not staked
    const ENOT_STAKED: u64 = 5;
    /// Insufficient balance to stake
    const EINSUFFICIENT_BALANCE: u64 = 6;

    struct StakingPool has key {
        total_staked: u64,
        rewards_per_second: u64,
    }

    struct StakedPosition has key {
        amount_staked: u64,
        last_reward_update_timestamp_secs: u64,
        pending_rewards: u64,
    }

    #[event]
    struct StakeEvent has drop, store {
        staker: address,
        amount_staked: u64,
        total_pool_staked: u64,
        staked_at: u64,
    }

    #[event]
    struct UnstakeEvent has drop, store {
        staker: address,
        amount_unstaked: u64,
        rewards_claimed: u64,
        total_pool_staked: u64,
        unstaked_at: u64,
    }

    #[event]
    struct RewardsClaimed has drop, store {
        staker: address,
        rewards_amount: u64,
        claimed_at: u64,
    }

    #[event]
    struct RewardRateUpdated has drop, store {
        admin: address,
        old_rate: u64,
        new_rate: u64,
        updated_at: u64,
    }

    public entry fun initialize_staking_pool(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<StakingPool>(admin_addr), EPOOL_ALREADY_INITIALIZED);

        move_to(admin, StakingPool {
            total_staked: 0,
            rewards_per_second: 100, // 100 HEART tokens per second as base reward
        });
    }

    fun update_rewards(staker_addr: address) acquires StakingPool, StakedPosition {
        let pool = borrow_global<StakingPool>(@charity_addr);
        let position = borrow_global_mut<StakedPosition>(staker_addr);
        let now = timestamp::now_seconds();

        if (now > position.last_reward_update_timestamp_secs) {
            let time_elapsed = now - position.last_reward_update_timestamp_secs;
            // Calculate rewards: (staked_amount * time * reward_rate) / scale_factor
            // Scale factor prevents overflow and provides reasonable reward rates
            let new_rewards = (position.amount_staked * time_elapsed * pool.rewards_per_second) / 1_000_000_000;
            position.pending_rewards += new_rewards;
        };
        position.last_reward_update_timestamp_secs = now;
    }

    public entry fun stake(staker: &signer, amount: u64) acquires StakingPool {
        let staker_addr = signer::address_of(staker);
        assert!(exists<StakingPool>(@charity_addr), EPOOL_NOT_INITIALIZED);
        assert!(!exists<StakedPosition>(staker_addr), EALREADY_STAKED);
        assert!(amount > 0, EZERO_AMOUNT_STAKED);

        // Check if user has sufficient HEART token balance
        let balance = charity::get_heart_balance(staker_addr);
        assert!(balance >= amount, EINSUFFICIENT_BALANCE);

        // Transfer HEART tokens to the staking contract for custody
        charity::transfer_heart_tokens(staker, @charity_addr, amount);

        // Update pool stats
        let pool = borrow_global_mut<StakingPool>(@charity_addr);
        pool.total_staked += amount;

        // Create staked position for user
        move_to(staker, StakedPosition {
            amount_staked: amount,
            last_reward_update_timestamp_secs: timestamp::now_seconds(),
            pending_rewards: 0,
        });

        // Emit stake event
        event::emit(StakeEvent {
            staker: staker_addr,
            amount_staked: amount,
            total_pool_staked: pool.total_staked,
            staked_at: timestamp::now_seconds(),
        });
    }

    public entry fun unstake(staker: &signer) acquires StakingPool, StakedPosition {
        let staker_addr = signer::address_of(staker);
        assert!(exists<StakedPosition>(staker_addr), ENOT_STAKED);

        // Update rewards before unstaking
        update_rewards(staker_addr);

        let position = move_from<StakedPosition>(staker_addr);
        let StakedPosition { amount_staked, pending_rewards, .. } = position;

        let pool = borrow_global_mut<StakingPool>(@charity_addr);
        pool.total_staked -= amount_staked;

        // Return original staked tokens by minting them back (simplified approach)
        // In production, you'd want a more sophisticated custody mechanism
        if (amount_staked > 0) {
            let original_tokens = charity::mint_heart_tokens(amount_staked);
            charity::deposit_heart_tokens(staker_addr, original_tokens);
        };

        // Mint reward tokens for the user
        if (pending_rewards > 0) {
            let reward_tokens = charity::mint_heart_tokens(pending_rewards);
            charity::deposit_heart_tokens(staker_addr, reward_tokens);
        };

        // Emit unstake event
        event::emit(UnstakeEvent {
            staker: staker_addr,
            amount_unstaked: amount_staked,
            rewards_claimed: pending_rewards,
            total_pool_staked: pool.total_staked,
            unstaked_at: timestamp::now_seconds(),
        });
    }

    public entry fun claim_rewards(staker: &signer) acquires StakingPool, StakedPosition {
        let staker_addr = signer::address_of(staker);
        assert!(exists<StakedPosition>(staker_addr), ENOT_STAKED);

        update_rewards(staker_addr);

        let position = borrow_global_mut<StakedPosition>(staker_addr);
        let rewards = position.pending_rewards;
        if (rewards > 0) {
            position.pending_rewards = 0;
            
            // Mint reward tokens for the user
            let reward_tokens = charity::mint_heart_tokens(rewards);
            charity::deposit_heart_tokens(staker_addr, reward_tokens);

            // Emit rewards claimed event
            event::emit(RewardsClaimed {
                staker: staker_addr,
                rewards_amount: rewards,
                claimed_at: timestamp::now_seconds(),
            });
        };
    }

    // Additional entry function to update pool parameters (admin only)
    public entry fun update_reward_rate(admin: &signer, new_rate: u64) acquires StakingPool {
        let admin_addr = signer::address_of(admin);
        // Only the pool creator (admin) can update rates
        assert!(exists<StakingPool>(admin_addr), EPOOL_NOT_INITIALIZED);
        
        let pool = borrow_global_mut<StakingPool>(admin_addr);
        let old_rate = pool.rewards_per_second;
        pool.rewards_per_second = new_rate;

        // Emit reward rate update event
        event::emit(RewardRateUpdated {
            admin: admin_addr,
            old_rate,
            new_rate,
            updated_at: timestamp::now_seconds(),
        });
    }

    #[view]
    public fun get_staked_position(staker_addr: address): (u64, u64) acquires StakedPosition {
        if (!exists<StakedPosition>(staker_addr)) {
            return (0, 0)
        };
        
        let position = borrow_global<StakedPosition>(staker_addr);
        (position.amount_staked, position.pending_rewards)
    }

    #[view]
    public fun get_current_rewards(staker_addr: address): u64 acquires StakingPool, StakedPosition {
        if (!exists<StakedPosition>(staker_addr)) {
            return 0
        };
        
        let pool = borrow_global<StakingPool>(@charity_addr);
        let position = borrow_global<StakedPosition>(staker_addr);
        let now = timestamp::now_seconds();
        
        if (now > position.last_reward_update_timestamp_secs) {
            let time_elapsed = now - position.last_reward_update_timestamp_secs;
            let new_rewards = (position.amount_staked * time_elapsed * pool.rewards_per_second) / 1_000_000_000;
            position.pending_rewards + new_rewards
        } else {
            position.pending_rewards
        }
    }

    #[view]
    public fun get_pool_info(): (u64, u64) acquires StakingPool {
        let pool = borrow_global<StakingPool>(@charity_addr);
        (pool.total_staked, pool.rewards_per_second)
    }

    #[view]
    public fun is_staked(staker_addr: address): bool {
        exists<StakedPosition>(staker_addr)
    }

    // Function for governance integration - get voting power
    #[view] 
    public fun get_voting_power(staker_addr: address): u64 acquires StakedPosition {
        if (!exists<StakedPosition>(staker_addr)) {
            return 0
        };
        let position = borrow_global<StakedPosition>(staker_addr);
        position.amount_staked
    }
}