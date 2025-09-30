#[test_only]
module charity_addr::test_staking {
    use std::signer;
    use charity_addr::staking;
    use charity_addr::charity;

    #[test(admin = @charity_addr, bob = @0xB0B)]
    fun test_full_staking_lifecycle(admin: &signer, bob: &signer) {
        // 1. SETUP: Initialize the charity minter and staking pool
        charity::initialize_charity_minter(admin);
        staking::initialize_staking_pool(admin);

        // Give bob 1000 HEART tokens to play with
        let heart_tokens = charity::mint_heart_tokens(1000);
        charity::deposit_heart_tokens(signer::address_of(bob), heart_tokens);
        assert!(charity::get_heart_balance(signer::address_of(bob)) == 1000, 0);

        // 2. STAKE: Bob stakes 500 HEART tokens
        staking::stake(bob, 500);

        // ASSERT: Check that Bob's staked position is correct
        let (staked_amount, pending_rewards) = staking::get_staked_position(signer::address_of(bob));
        assert!(staked_amount == 500, 1);
        assert!(pending_rewards == 0, 2);

        // ASSERT: Check that the total staked in the pool is correct
        let (total_staked, _) = staking::get_pool_info();
        assert!(total_staked == 500, 3);

        // ASSERT: Check that Bob's liquid HEART balance is now 500
        assert!(charity::get_heart_balance(signer::address_of(bob)) == 500, 4);

        // 3. UNSTAKE: Bob unstakes his tokens
        // Note: For a real test, you'd advance the timestamp to check rewards. Here we just check the mechanics.
        staking::unstake(bob);

        // ASSERT: Check that Bob's staked position no longer exists
        assert!(!staking::is_staked(signer::address_of(bob)), 5);
        let (staked_amount_after, _) = staking::get_staked_position(signer::address_of(bob));
        assert!(staked_amount_after == 0, 6);

        // ASSERT: Check that the total staked in the pool is now 0
        let (total_staked_after, _) = staking::get_pool_info();
        assert!(total_staked_after == 0, 7);

        // ASSERT: Check that Bob got his 500 HEART tokens back
        assert!(charity::get_heart_balance(signer::address_of(bob)) == 1000, 8);
    }

    #[test(admin = @charity_addr, bob = @0xB0B)]
    #[expected_failure(abort_code = 6, location = charity_addr::staking)]
    fun test_stake_fails_with_insufficient_balance(admin: &signer, bob: &signer) {
        // SETUP
        charity::initialize_charity_minter(admin);
        staking::initialize_staking_pool(admin);

        // Bob has 0 HEART tokens
        assert!(charity::get_heart_balance(signer::address_of(bob)) == 0, 0);

        // ACTION: Try to stake 500. This should fail.
        staking::stake(bob, 500);
    }
}