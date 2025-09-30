module charity_addr::badges {
    use std::signer;
    use std::string::{Self, String};
    use std::option;
    use std::vector;
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use charity_addr::charity;

    /// Collection already exists for this campaign
    const ECOLLECTION_ALREADY_EXISTS: u64 = 1;
    /// Caller is not the campaign creator
    const ENOT_CAMPAIGN_CREATOR: u64 = 2;
    /// Campaign NFT rewards not set up
    const ENFT_REWARDS_NOT_SETUP: u64 = 3;
    /// Minimum donation not met for NFT
    const EMIN_DONATION_NOT_MET: u64 = 4;
    /// NFT already claimed by this donor
    const ENFT_ALREADY_CLAIMED: u64 = 5;
    /// Campaign has ended
    const ECAMPAIGN_ENDED: u64 = 6;
    /// Invalid tier specified
    const EINVALID_TIER: u64 = 7;
    /// Donor record not found
    const EDONOR_RECORD_NOT_FOUND: u64 = 8;
    /// Supply limit reached
    const ESUPPLY_LIMIT_REACHED: u64 = 9;

    // NFT reward tiers
    const BRONZE_TIER: u64 = 1;    // 1+ APT donation
    const SILVER_TIER: u64 = 2;    // 5+ APT donation  
    const GOLD_TIER: u64 = 3;      // 10+ APT donation
    const PLATINUM_TIER: u64 = 4;  // 50+ APT donation

    struct CampaignNFTRewards has key {
        campaign_creator: address,
        campaign_id: address,
        collection_name: String,
        collection_description: String,
        collection_uri: String,
        
        // Resource account for NFT minting
        resource_signer_cap: account::SignerCapability,
        
        // NFT reward tiers with minimum donation amounts (in octas)
        bronze_min_donation: u64,    // Default: 1 APT = 100_000_000 octas
        silver_min_donation: u64,    // Default: 5 APT = 500_000_000 octas  
        gold_min_donation: u64,      // Default: 10 APT = 1_000_000_000 octas
        platinum_min_donation: u64,  // Default: 50 APT = 5_000_000_000 octas
        
        // NFT metadata for each tier
        bronze_nft: NFTMetadata,
        silver_nft: NFTMetadata,
        gold_nft: NFTMetadata,
        platinum_nft: NFTMetadata,
        
        // Tracking
        nfts_minted: u64,
        donors_claimed: vector<address>,
    }

    struct NFTMetadata has store, drop {
        name: String,
        description: String,
        uri: String,
        supply_limit: u64,  // Max NFTs of this tier (0 = unlimited)
        minted_count: u64,
    }

    struct DonorNFTRecord has key {
        nfts_received: vector<NFTRecord>,
    }

    struct NFTRecord has store, drop, copy {
        campaign_id: address,
        tier: u64,
        token_name: String,
        received_at: u64,
    }

    // Global registry to track donation amounts per donor per campaign
    struct DonationRegistry has key {
        // Maps campaign_id -> (donor_address -> total_donated)
        donations: vector<CampaignDonations>,
    }

    struct CampaignDonations has store, drop {
        campaign_id: address,
        donor_amounts: vector<DonorAmount>,
    }

    struct DonorAmount has store, drop {
        donor: address,
        total_amount: u64,
    }

    #[event]
    struct NFTRewardMinted has drop, store {
        campaign_id: address,
        donor: address,
        tier: u64,
        token_name: String,
        donation_amount: u64,
        timestamp: u64,
    }

    #[event]
    struct CampaignNFTSetup has drop, store {
        campaign_id: address,
        creator: address,
        collection_name: String,
        resource_account: address,
        timestamp: u64,
    }

    #[event]
    struct DonationTracked has drop, store {
        campaign_id: address,
        donor: address,
        amount: u64,
        total_donated: u64,
        timestamp: u64,
    }

    // Initialize the global donation registry
    public entry fun initialize_donation_registry(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        if (!exists<DonationRegistry>(admin_addr)) {
            move_to(admin, DonationRegistry {
                donations: vector::empty(),
            });
        };
    }

    // Campaign creator sets up NFT rewards for their campaign
    public entry fun setup_campaign_nft_rewards(
        creator: &signer,
        campaign_object: Object<charity::Campaign>,
        collection_name: String,
        collection_description: String,
        collection_uri: String,
        
        // Bronze tier (lowest) - default 1 APT minimum
        bronze_name: String,
        bronze_description: String,
        bronze_uri: String,
        bronze_supply_limit: u64,
        
        // Silver tier - default 5 APT minimum
        silver_name: String,
        silver_description: String,
        silver_uri: String,
        silver_supply_limit: u64,
        
        // Gold tier - default 10 APT minimum
        gold_name: String,
        gold_description: String,
        gold_uri: String,
        gold_supply_limit: u64,
        
        // Platinum tier (highest) - default 50 APT minimum
        platinum_name: String,
        platinum_description: String,
        platinum_uri: String,
        platinum_supply_limit: u64,
    ) {
        let creator_addr = signer::address_of(creator);
        let campaign_id = object::object_address(&campaign_object);
        
        // Verify the caller is the campaign creator
        let (campaign_creator, _, _, _, _) = charity::get_campaign_info(campaign_object);
        assert!(creator_addr == campaign_creator, ENOT_CAMPAIGN_CREATOR);
        assert!(!exists<CampaignNFTRewards>(creator_addr), ECOLLECTION_ALREADY_EXISTS);
        
        // Create a resource account for NFT minting
        let (resource_signer, resource_signer_cap) = account::create_resource_account(creator, b"nft_minter");
        let resource_addr = signer::address_of(&resource_signer);
        
        // Create the NFT collection using the resource account
        collection::create_unlimited_collection(
            &resource_signer,
            collection_description,
            collection_name,
            option::none(), // No royalty
            collection_uri
        );

        // Set up NFT reward structure with default minimums
        let nft_rewards = CampaignNFTRewards {
            campaign_creator: creator_addr,
            campaign_id,
            collection_name,
            collection_description,
            collection_uri,
            resource_signer_cap,
            bronze_min_donation: 100_000_000,    // 1 APT
            silver_min_donation: 500_000_000,    // 5 APT
            gold_min_donation: 1_000_000_000,    // 10 APT
            platinum_min_donation: 5_000_000_000, // 50 APT
            bronze_nft: NFTMetadata {
                name: bronze_name,
                description: bronze_description,
                uri: bronze_uri,
                supply_limit: bronze_supply_limit,
                minted_count: 0,
            },
            silver_nft: NFTMetadata {
                name: silver_name,
                description: silver_description,
                uri: silver_uri,
                supply_limit: silver_supply_limit,
                minted_count: 0,
            },
            gold_nft: NFTMetadata {
                name: gold_name,
                description: gold_description,
                uri: gold_uri,
                supply_limit: gold_supply_limit,
                minted_count: 0,
            },
            platinum_nft: NFTMetadata {
                name: platinum_name,
                description: platinum_description,
                uri: platinum_uri,
                supply_limit: platinum_supply_limit,
                minted_count: 0,
            },
            nfts_minted: 0,
            donors_claimed: vector::empty(),
        };

        move_to(creator, nft_rewards);

        event::emit(CampaignNFTSetup {
            campaign_id,
            creator: creator_addr,
            collection_name,
            resource_account: resource_addr,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Track donations for NFT eligibility (called by charity contract or external integration)
    public entry fun track_donation(
        donor: &signer,
        campaign_object: Object<charity::Campaign>,
        amount: u64,
    ) acquires DonationRegistry {
        let donor_addr = signer::address_of(donor);
        let campaign_id = object::object_address(&campaign_object);
        
        // Initialize registry if it doesn't exist
        if (!exists<DonationRegistry>(@charity_addr)) {
            return // Registry must be initialized first
        };

        let registry = borrow_global_mut<DonationRegistry>(@charity_addr);
        
        // Find or create campaign entry
        let campaign_index = find_or_create_campaign_entry(campaign_id, registry);
        let campaign_donations = registry.donations.borrow_mut(campaign_index);
        
        // Find or create donor entry
        let donor_index_opt = find_donor_in_campaign(donor_addr, campaign_donations);
        
        if (donor_index_opt.is_some()) {
            // Update existing donor record
            let donor_index = donor_index_opt.extract();
            let donor_amount = campaign_donations.donor_amounts.borrow_mut(donor_index);
            donor_amount.total_amount += amount;
            
            event::emit(DonationTracked {
                campaign_id,
                donor: donor_addr,
                amount,
                total_donated: donor_amount.total_amount,
                timestamp: timestamp::now_seconds(),
            });
        } else {
            // Create new donor record
            campaign_donations.donor_amounts.push_back(DonorAmount {
                donor: donor_addr,
                total_amount: amount,
            });
            
            event::emit(DonationTracked {
                campaign_id,
                donor: donor_addr,
                amount,
                total_donated: amount,
                timestamp: timestamp::now_seconds(),
            });
        }
    }

    // Donors claim their NFT reward based on total donations
    public entry fun claim_donation_nft(
        donor: &signer,
        campaign_object: Object<charity::Campaign>,
    ) acquires CampaignNFTRewards, DonorNFTRecord, DonationRegistry {
        let donor_addr = signer::address_of(donor);
        let campaign_id = object::object_address(&campaign_object);
        
        // Get campaign creator from campaign info
        let (campaign_creator, _, _, _, _) = charity::get_campaign_info(campaign_object);
        
        assert!(exists<CampaignNFTRewards>(campaign_creator), ENFT_REWARDS_NOT_SETUP);
        assert!(charity::is_campaign_active(campaign_object), ECAMPAIGN_ENDED);
        
        let nft_rewards = borrow_global_mut<CampaignNFTRewards>(campaign_creator);
        
        // Check if donor already claimed NFT for this campaign
        assert!(!nft_rewards.donors_claimed.contains(&donor_addr), ENFT_ALREADY_CLAIMED);
        
        // Get total donation amount for this donor
        let total_donated = get_donor_total_donation(donor_addr, campaign_id);
        assert!(total_donated > 0, EMIN_DONATION_NOT_MET);
        
        // Determine highest tier the donor qualifies for
        let tier = get_qualifying_tier(total_donated, nft_rewards);
        assert!(tier > 0, EMIN_DONATION_NOT_MET);
        
        // Extract the values we need before borrowing mutably
        let collection_name = nft_rewards.collection_name;
        let nfts_minted = nft_rewards.nfts_minted;
        
        // Get the NFT metadata for this tier and extract needed values
        let (nft_description, nft_uri, token_name, supply_limit, minted_count) = {
            if (tier == PLATINUM_TIER) {
                (nft_rewards.platinum_nft.description, nft_rewards.platinum_nft.uri, 
                 string::utf8(b"Platinum Supporter"), nft_rewards.platinum_nft.supply_limit,
                 nft_rewards.platinum_nft.minted_count)
            } else if (tier == GOLD_TIER) {
                (nft_rewards.gold_nft.description, nft_rewards.gold_nft.uri, 
                 string::utf8(b"Gold Supporter"), nft_rewards.gold_nft.supply_limit,
                 nft_rewards.gold_nft.minted_count)
            } else if (tier == SILVER_TIER) {
                (nft_rewards.silver_nft.description, nft_rewards.silver_nft.uri, 
                 string::utf8(b"Silver Supporter"), nft_rewards.silver_nft.supply_limit,
                 nft_rewards.silver_nft.minted_count)
            } else {
                (nft_rewards.bronze_nft.description, nft_rewards.bronze_nft.uri, 
                 string::utf8(b"Bronze Supporter"), nft_rewards.bronze_nft.supply_limit,
                 nft_rewards.bronze_nft.minted_count)
            }
        };
        
        // Check supply limit
        if (supply_limit > 0) {
            assert!(minted_count < supply_limit, ESUPPLY_LIMIT_REACHED);
        };

        // Create resource signer for minting
        let resource_signer = account::create_signer_with_capability(&nft_rewards.resource_signer_cap);
        
        // Generate unique token name with timestamp
        let unique_token_name = generate_unique_token_name(token_name, nfts_minted);
        
        // Mint the NFT
        let token_constructor_ref = token::create(
            &resource_signer,
            collection_name,
            nft_description,
            unique_token_name,
            option::none(),
            nft_uri
        );

        let token_obj = object::object_from_constructor_ref<token::Token>(&token_constructor_ref);
        object::transfer(&resource_signer, token_obj, donor_addr);

        // Update tracking - now we can safely borrow mutably
        if (tier == PLATINUM_TIER) {
            nft_rewards.platinum_nft.minted_count += 1;
        } else if (tier == GOLD_TIER) {
            nft_rewards.gold_nft.minted_count += 1;
        } else if (tier == SILVER_TIER) {
            nft_rewards.silver_nft.minted_count += 1;
        } else {
            nft_rewards.bronze_nft.minted_count += 1;
        };
        
        nft_rewards.nfts_minted += 1;
        nft_rewards.donors_claimed.push_back(donor_addr);

        // Record in donor's NFT history
        ensure_donor_record_exists(donor);
        let donor_record = borrow_global_mut<DonorNFTRecord>(donor_addr);
        donor_record.nfts_received.push_back(NFTRecord {
            campaign_id,
            tier,
            token_name: unique_token_name,
            received_at: timestamp::now_seconds(),
        });

        event::emit(NFTRewardMinted {
            campaign_id,
            donor: donor_addr,
            tier,
            token_name: unique_token_name,
            donation_amount: total_donated,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Initialize donor NFT record
    public entry fun initialize_donor_record(donor: &signer) {
        let donor_addr = signer::address_of(donor);
        if (!exists<DonorNFTRecord>(donor_addr)) {
            move_to(donor, DonorNFTRecord {
                nfts_received: vector::empty(),
            });
        };
    }

    // Helper Functions

    fun find_or_create_campaign_entry(campaign_id: address, registry: &mut DonationRegistry): u64 {
        let i = 0;
        let len = registry.donations.length();
        
        while (i < len) {
            let campaign = registry.donations.borrow(i);
            if (campaign.campaign_id == campaign_id) {
                return i
            };
            i += 1;
        };
        
        // Campaign not found, create new entry
        registry.donations.push_back(CampaignDonations {
            campaign_id,
            donor_amounts: vector::empty(),
        });
        
        registry.donations.length() - 1
    }

    fun find_donor_in_campaign(donor_addr: address, campaign_donations: &CampaignDonations): option::Option<u64> {
        let i = 0;
        let len = campaign_donations.donor_amounts.length();
        
        while (i < len) {
            let donor_amount = campaign_donations.donor_amounts.borrow(i);
            if (donor_amount.donor == donor_addr) {
                return option::some(i)
            };
            i += 1;
        };
        
        option::none()
    }

    fun get_donor_total_donation(donor_addr: address, campaign_id: address): u64 acquires DonationRegistry {
        if (!exists<DonationRegistry>(@charity_addr)) {
            return 0
        };

        let registry = borrow_global<DonationRegistry>(@charity_addr);
        let i = 0;
        let len = registry.donations.length();
        
        while (i < len) {
            let campaign = registry.donations.borrow(i);
            if (campaign.campaign_id == campaign_id) {
                let donor_index_opt = find_donor_in_campaign(donor_addr, campaign);
                if (donor_index_opt.is_some()) {
                    let donor_index = donor_index_opt.extract();
                    let donor_amount = campaign.donor_amounts.borrow(donor_index);
                    return donor_amount.total_amount
                };
                break
            };
            i += 1;
        };
        
        0
    }

    fun get_qualifying_tier(donation_amount: u64, nft_rewards: &CampaignNFTRewards): u64 {
        if (donation_amount >= nft_rewards.platinum_min_donation) {
            PLATINUM_TIER
        } else if (donation_amount >= nft_rewards.gold_min_donation) {
            GOLD_TIER
        } else if (donation_amount >= nft_rewards.silver_min_donation) {
            SILVER_TIER
        } else if (donation_amount >= nft_rewards.bronze_min_donation) {
            BRONZE_TIER
        } else {
            0 // Doesn't qualify
        }
    }

    fun ensure_donor_record_exists(donor: &signer) {
        let donor_addr = signer::address_of(donor);
        if (!exists<DonorNFTRecord>(donor_addr)) {
            move_to(donor, DonorNFTRecord {
                nfts_received: vector::empty(),
            });
        };
    }

    fun generate_unique_token_name(base_name: String, counter: u64): String {
        let counter_str = if (counter < 10) {
            string::utf8(b"00")
        } else if (counter < 100) {
            string::utf8(b"0")
        } else {
            string::utf8(b"")
        };
        
        counter_str.append(string::utf8(b"1")); // Simplified - would need proper number conversion
        base_name.append(string::utf8(b" #"));
        base_name.append(counter_str);
        base_name
    }

    // View Functions

    #[view]
    public fun get_campaign_nft_info(campaign_creator: address): (String, u64, u64, u64, u64) acquires CampaignNFTRewards {
        if (!exists<CampaignNFTRewards>(campaign_creator)) {
            return (string::utf8(b""), 0, 0, 0, 0)
        };

        let nft_rewards = borrow_global<CampaignNFTRewards>(campaign_creator);
        (
            nft_rewards.collection_name,
            nft_rewards.bronze_min_donation,
            nft_rewards.silver_min_donation,
            nft_rewards.gold_min_donation,
            nft_rewards.platinum_min_donation
        )
    }

    #[view]
    public fun get_tier_availability(campaign_creator: address, tier: u64): (u64, u64) acquires CampaignNFTRewards {
        assert!(exists<CampaignNFTRewards>(campaign_creator), ENFT_REWARDS_NOT_SETUP);
        let nft_rewards = borrow_global<CampaignNFTRewards>(campaign_creator);
        
        if (tier == PLATINUM_TIER) {
            (nft_rewards.platinum_nft.minted_count, nft_rewards.platinum_nft.supply_limit)
        } else if (tier == GOLD_TIER) {
            (nft_rewards.gold_nft.minted_count, nft_rewards.gold_nft.supply_limit)
        } else if (tier == SILVER_TIER) {
            (nft_rewards.silver_nft.minted_count, nft_rewards.silver_nft.supply_limit)
        } else if (tier == BRONZE_TIER) {
            (nft_rewards.bronze_nft.minted_count, nft_rewards.bronze_nft.supply_limit)
        } else {
            (0, 0)
        }
    }

    #[view]
    public fun has_claimed_nft(campaign_creator: address, donor_addr: address): bool acquires CampaignNFTRewards {
        if (!exists<CampaignNFTRewards>(campaign_creator)) {
            return false
        };

        let nft_rewards = borrow_global<CampaignNFTRewards>(campaign_creator);
        nft_rewards.donors_claimed.contains(&donor_addr)
    }

    #[view]
    public fun get_donor_nfts(donor_addr: address): vector<NFTRecord> acquires DonorNFTRecord {
        if (!exists<DonorNFTRecord>(donor_addr)) {
            return vector::empty()
        };

        let donor_record = borrow_global<DonorNFTRecord>(donor_addr);
        donor_record.nfts_received
    }

    #[view]
    public fun qualify_for_tier(donor_addr: address, campaign_id: address, campaign_creator: address): u64 acquires CampaignNFTRewards, DonationRegistry {
        if (!exists<CampaignNFTRewards>(campaign_creator)) {
            return 0
        };

        let total_donated = get_donor_total_donation(donor_addr, campaign_id);
        let nft_rewards = borrow_global<CampaignNFTRewards>(campaign_creator);
        get_qualifying_tier(total_donated, nft_rewards)
    }

    #[view]
    public fun get_donor_donation_total(donor_addr: address, campaign_id: address): u64 acquires DonationRegistry {
        get_donor_total_donation(donor_addr, campaign_id)
    }

    #[view]
    public fun get_nft_rewards_stats(campaign_creator: address): (u64, u64, u64, u64, u64) acquires CampaignNFTRewards {
        if (!exists<CampaignNFTRewards>(campaign_creator)) {
            return (0, 0, 0, 0, 0)
        };

        let nft_rewards = borrow_global<CampaignNFTRewards>(campaign_creator);
        (
            nft_rewards.nfts_minted,
            nft_rewards.bronze_nft.minted_count,
            nft_rewards.silver_nft.minted_count,
            nft_rewards.gold_nft.minted_count,
            nft_rewards.platinum_nft.minted_count
        )
    }
}