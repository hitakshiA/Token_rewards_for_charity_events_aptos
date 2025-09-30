import { createClient } from "@supabase/supabase-js";

// --- CONFIGURATION ---
const APTOS_CONTRACT_ADDRESS = "0xe2fb002d94700d394877fcbaaf82bcfb53c6ce6b902d32c4bdea3ccf15f4ba62";
const PROCESSOR_NAME = "main_indexer";
const APTOS_INDEXER_URL = "https://api.testnet.aptoslabs.com/v1/graphql";

// --- HELPER FUNCTIONS ---

function getSupabaseAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

async function fetchEventsFromAptos(eventType: string, startVersion: string) {
  const query = `
    query GetEvents($where: events_bool_exp, $limit: Int, $order_by: [events_order_by!]) {
      events(where: $where, limit: $limit, order_by: $order_by) {
        account_address
        creation_number
        sequence_number
        data
        type
        transaction_version
        transaction_block_height
        indexed_type
      }
    }
  `;

  // For events with #[event] attribute, use indexed_type instead of type
  const variables = {
    where: {
      indexed_type: { _eq: `${APTOS_CONTRACT_ADDRESS}::charity::${eventType}` },
      transaction_version: { _gte: startVersion }
    },
    limit: 100,
    order_by: [{ transaction_version: "asc" }]
  };

  try {
    const response = await fetch(APTOS_INDEXER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error(`GraphQL errors for ${eventType}:`, result.errors);
      return [];
    }

    return result.data?.events || [];
  } catch (error) {
    console.error(`Error fetching events for ${eventType}:`, error);
    return [];
  }
}

async function handleEvents(supabase: any, events: any[], eventType: string, handler: (supabase: any, event: any) => Promise<void>) {
  if (events.length === 0) return 0;
  console.log(`Processing ${events.length} '${eventType}' events...`);
  
  for (const event of events) {
    try {
      await handler(supabase, event);
    } catch (error) {
      console.error(`Error handling '${eventType}' event version ${event.transaction_version}:`, error);
    }
  }
  
  return BigInt(events[events.length - 1].transaction_version);
}

// --- EVENT HANDLERS ---

async function handleCampaignCreated(supabase: any, event: any) {
  const data = event.data;
  await supabase.from('campaigns').upsert({
    campaign_id: data.campaign_id,
    creator_address: data.creator,
    description: data.description,
    goal_amount: data.goal_amount,
    end_timestamp_secs: data.end_timestamp_secs,
    created_at: new Date(parseInt(data.created_at) * 1000).toISOString(),
  });
}

async function handleDonation(supabase: any, event: any) {
  const data = event.data;
  const version = event.transaction_version;
  
  // Note: DonationEvent doesn't have a timestamp field, using current time
  await supabase.from('donations').upsert({
    transaction_hash: version,
    campaign_id: data.campaign_id,
    donor: data.donor,
    amount: data.amount,
    heart_tokens_minted: data.heart_tokens_minted,
    donated_at: new Date().toISOString(),
  });
  
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('total_donated')
    .eq('campaign_id', data.campaign_id)
    .single();
    
  if (error) { 
    console.error(`Campaign not found for donation: ${data.campaign_id}`, error); 
    return; 
  }
  
  const newTotal = (Number(campaign.total_donated) || 0) + Number(data.amount);
  await supabase
    .from('campaigns')
    .update({ total_donated: newTotal })
    .eq('campaign_id', data.campaign_id);
}

async function handleStake(supabase: any, event: any) {
  // Removed - not in charity.move contract
}

async function handleUnstake(supabase: any, event: any) {
  // Removed - not in charity.move contract
}

async function handleRewardsClaimed(supabase: any, event: any) {
  // Removed - not in charity.move contract
}

async function handleProposalCreated(supabase: any, event: any) {
  // Removed - not in charity.move contract
}

async function handleVoteCast(supabase: any, event: any) {
  // Removed - not in charity.move contract
}

async function handleFundsClaimed(supabase: any, event: any) {
  const data = event.data;
  const version = event.transaction_version;
  
  await supabase.from('funds_claimed').insert({
    transaction_hash: version,
    campaign_id: data.campaign_id,
    creator: data.creator,
    amount_claimed: data.amount_claimed,
    claimed_at: new Date(parseInt(data.claimed_at) * 1000).toISOString(),
  });
}

// --- MAIN SERVER LOGIC ---

Deno.serve(async (req) => {
  const supabase = getSupabaseAdminClient();

  try {
    console.log("Starting indexer run...");
    
    let { data: status, error } = await supabase
      .from('indexer_status')
      .select('last_processed_version')
      .eq('processor_name', PROCESSOR_NAME)
      .single();
    
    if (error || !status) {
      console.log("Could not fetch indexer status, starting from 0.", error);
      status = { last_processed_version: "0" };
    }
    
    const startingVersion = (BigInt(status.last_processed_version) + 1n).toString();
    console.log(`Starting sync from version: ${startingVersion}`);

    // Fetch all events in parallel
    console.log("Fetching events from Aptos Indexer...");
    const [
      campaignCreatedEvents, 
      donationEvents, 
      fundsClaimedEvents,
    ] = await Promise.all([
      fetchEventsFromAptos('CampaignCreated', startingVersion),
      fetchEventsFromAptos('DonationEvent', startingVersion),
      fetchEventsFromAptos('FundsClaimed', startingVersion),
    ]);
    
    console.log("Successfully fetched events from Aptos");
    
    let maxVersion = BigInt(status.last_processed_version);
    
    const eventProcessors = [
      { events: campaignCreatedEvents, type: 'CampaignCreated', handler: handleCampaignCreated },
      { events: donationEvents, type: 'DonationEvent', handler: handleDonation },
      { events: fundsClaimedEvents, type: 'FundsClaimed', handler: handleFundsClaimed },
    ];

    for (const processor of eventProcessors) {
      const lastVersion = await handleEvents(supabase, processor.events, processor.type, processor.handler);
      if (lastVersion > maxVersion) {
        maxVersion = lastVersion;
      }
    }
    
    if (maxVersion > BigInt(status.last_processed_version)) {
      console.log(`Sync complete. Updating indexer status to version: ${maxVersion}`);
      const { error: updateError } = await supabase.from('indexer_status').upsert({
        processor_name: PROCESSOR_NAME,
        last_processed_version: maxVersion.toString(),
      });
      
      if (updateError) {
        console.error("Failed to update indexer status:", updateError);
      }
    } else {
      console.log("No new events to process.");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Indexer run complete", 
        syncedToVersion: maxVersion.toString() 
      }), 
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Fatal error in indexer:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Unknown error occurred",
      }), 
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});