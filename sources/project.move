module charity_rewards::CharityRewards {
    use aptos_framework::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    
    /// A resource to hold the tokens for the reward pool.
    struct RewardPool has key {
        balance: coin::Coin<AptosCoin>,
    }
    

    
    /// Allows a user to deposit tokens into the reward pool.
    public fun deposit_tokens(depositor: &signer, amount: u64) acquires RewardPool {
        let pool = borrow_global_mut<RewardPool>(signer::address_of(depositor));
        let deposit_amount = coin::withdraw<AptosCoin>(depositor, amount);
        coin::merge(&mut pool.balance, deposit_amount);
    }
    
    /// Allows an event participant to claim their reward.
    public fun claim_reward(
        claimant: &signer, 
        organizer_address: address, 
        amount: u64
    ) acquires RewardPool {
        let pool = borrow_global_mut<RewardPool>(organizer_address);
        let reward_coin = coin::extract(&mut pool.balance, amount);
        coin::deposit<AptosCoin>(signer::address_of(claimant), reward_coin);
    }
}