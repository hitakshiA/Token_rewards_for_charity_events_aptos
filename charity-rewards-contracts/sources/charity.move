module charity_addr::charity {
    use std::signer;
    use std::string::{Self, String};
    use std::option;
    use aptos_framework::object::{Self, Object, ExtendRef};
    use aptos_framework::fungible_asset::{Self, MintRef, Metadata};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::aptos_account;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    struct HEART has drop {}

    struct HeartMinter has key {
        mint_ref: MintRef,
        metadata: Object<Metadata>,
    }

    struct Campaign has key {
        creator: address,
        description: String,
        goal_amount: u64,
        end_timestamp_secs: u64,
        total_donated: u64,
        extend_ref: ExtendRef,
    }

    #[event]
    struct DonationEvent has drop, store {
        campaign_id: address,
        donor: address,
        amount: u64,
        heart_tokens_minted: u64,
    }

    #[event]
    struct CampaignCreated has drop, store {
        campaign_id: address,
        creator: address,
        description: String,
        goal_amount: u64,
        end_timestamp_secs: u64,
        created_at: u64,
    }

    #[event]
    struct FundsClaimed has drop, store {
        campaign_id: address,
        creator: address,
        amount_claimed: u64,
        claimed_at: u64,
    }

    /// Campaign has already ended
    const ECAMPAIGN_ENDED: u64 = 1;

    /// Campaign goal was not met
    const EGOAL_NOT_MET: u64 = 2;

    /// Caller is not the campaign creator
    const ENOT_CAMPAIGN_CREATOR: u64 = 3;

    /// HEART minter not initialized
    const EHEART_MINTER_NOT_INITIALIZED: u64 = 4;


    public entry fun initialize_charity_minter(creator: &signer) {
        let creator_addr = signer::address_of(creator);
        if (exists<HeartMinter>(creator_addr)) {
            return
        };

        let constructor_ref = &object::create_named_object(creator, b"HEART Token");

        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(),
            string::utf8(b"HEART Token"),
            string::utf8(b"HEART"),
            8,
            string::utf8(b"https://your-project.com/heart_icon.png"),
            string::utf8(b"https://your-project.com")
        );

        let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);
        let metadata = object::object_from_constructor_ref<Metadata>(constructor_ref);

        move_to(creator, HeartMinter { mint_ref, metadata });
    }

    public entry fun create_campaign(
        creator: &signer,
        description: String,
        goal_amount: u64,
        end_timestamp_secs: u64,
    ) {
        let creator_addr = signer::address_of(creator);
        let constructor_ref = object::create_object(creator_addr);
        let object_signer = object::generate_signer(&constructor_ref);
        let extend_ref = object::generate_extend_ref(&constructor_ref);

        let object_addr = signer::address_of(&object_signer);

        move_to(&object_signer, Campaign {
            creator: creator_addr,
            description,
            goal_amount,
            end_timestamp_secs,
            total_donated: 0,
            extend_ref,
        });

        event::emit(CampaignCreated {
            campaign_id: object_addr,
            creator: creator_addr,
            description,
            goal_amount,
            end_timestamp_secs,
            created_at: timestamp::now_seconds(),
        });
    }

    public entry fun donate(
        donor: &signer,
        campaign_object: Object<Campaign>,
        amount: u64,
    ) acquires Campaign, HeartMinter {
        let campaign_address = object::object_address(&campaign_object);
        let campaign_data = borrow_global_mut<Campaign>(campaign_address);
        let donor_addr = signer::address_of(donor);

        assert!(timestamp::now_seconds() < campaign_data.end_timestamp_secs, ECAMPAIGN_ENDED);

        // Transfer APT with the aptos_account helper; it auto-registers stores and bridges coin/FA
        aptos_account::transfer_coins<AptosCoin>(donor, campaign_address, amount);

        campaign_data.total_donated += amount;

        // Reward donors with HEART tokens: 2 HEART per 1 APT donated (100_000_000 octas)
        let heart_reward = (amount / 100_000_000) * 2;
        if (heart_reward > 0) {
            let minter_cap = borrow_global<HeartMinter>(campaign_data.creator);
            let heart_tokens = fungible_asset::mint(&minter_cap.mint_ref, heart_reward);
            primary_fungible_store::deposit(donor_addr, heart_tokens);
        };

        event::emit(DonationEvent {
            campaign_id: campaign_address,
            donor: donor_addr,
            amount,
            heart_tokens_minted: heart_reward,
        });
    }

    public entry fun claim_funds(
        caller: &signer,
        campaign_object: Object<Campaign>
    ) acquires Campaign {
        let campaign_address = object::object_address(&campaign_object);
        let campaign_data = borrow_global<Campaign>(campaign_address);
        let caller_addr = signer::address_of(caller);

        assert!(caller_addr == campaign_data.creator, ENOT_CAMPAIGN_CREATOR);
        assert!(timestamp::now_seconds() >= campaign_data.end_timestamp_secs, ECAMPAIGN_ENDED);
        assert!(campaign_data.total_donated >= campaign_data.goal_amount, EGOAL_NOT_MET);

        // Read APT balance (paired coin/FA) and transfer out using an object signer
        let balance = coin::balance<AptosCoin>(campaign_address);
        if (balance > 0) {
            let campaign_signer = object::generate_signer_for_extending(&campaign_data.extend_ref);
            aptos_account::transfer_coins<AptosCoin>(&campaign_signer, caller_addr, balance);

            event::emit(FundsClaimed {
                campaign_id: campaign_address,
                creator: caller_addr,
                amount_claimed: balance,
                claimed_at: timestamp::now_seconds(),
            });
        };
    }

    // HEART helpers
    public fun mint_heart_tokens(amount: u64): fungible_asset::FungibleAsset acquires HeartMinter {
        let minter_cap = borrow_global<HeartMinter>(@charity_addr);
        fungible_asset::mint(&minter_cap.mint_ref, amount)
    }

    public fun withdraw_heart_tokens(from_signer: &signer, amount: u64): fungible_asset::FungibleAsset acquires HeartMinter {
        let minter_cap = borrow_global<HeartMinter>(@charity_addr);
        primary_fungible_store::withdraw(from_signer, minter_cap.metadata, amount)
    }

    public fun deposit_heart_tokens(to_addr: address, tokens: fungible_asset::FungibleAsset) {
        primary_fungible_store::deposit(to_addr, tokens);
    }

    public fun transfer_heart_tokens(from_signer: &signer, to_addr: address, amount: u64) acquires HeartMinter {
        let minter_cap = borrow_global<HeartMinter>(@charity_addr);
        let tokens = primary_fungible_store::withdraw(from_signer, minter_cap.metadata, amount);
        primary_fungible_store::deposit(to_addr, tokens);
    }

    #[view]
    public fun get_heart_balance(addr: address): u64 acquires HeartMinter {
        let minter_cap = borrow_global<HeartMinter>(@charity_addr);
        primary_fungible_store::balance(addr, minter_cap.metadata)
    }

    #[view]
    public fun get_heart_metadata(): Object<Metadata> acquires HeartMinter {
        let minter_cap = borrow_global<HeartMinter>(@charity_addr);
        minter_cap.metadata
    }

    // Views
    #[view]
    public fun get_campaign_info(campaign_object: Object<Campaign>): (address, String, u64, u64, u64) acquires Campaign {
        let campaign_address = object::object_address(&campaign_object);
        let campaign_data = borrow_global<Campaign>(campaign_address);
        (
            campaign_data.creator,
            campaign_data.description,
            campaign_data.goal_amount,
            campaign_data.end_timestamp_secs,
            campaign_data.total_donated
        )
    }

    #[view]
    public fun is_campaign_active(campaign_object: Object<Campaign>): bool acquires Campaign {
        let campaign_address = object::object_address(&campaign_object);
        let campaign_data = borrow_global<Campaign>(campaign_address);
        timestamp::now_seconds() < campaign_data.end_timestamp_secs
    }

    #[view]
    public fun is_campaign_successful(campaign_object: Object<Campaign>): bool acquires Campaign {
        let campaign_address = object::object_address(&campaign_object);
        let campaign_data = borrow_global<Campaign>(campaign_address);
        campaign_data.total_donated >= campaign_data.goal_amount
    }
}
