import { Account, Aptos, AptosConfig, Network, U64, Ed25519PrivateKey, Ed25519Account } from "@aptos-labs/ts-sdk";
import { createClient } from "@supabase/supabase-js";
import readline from "readline";

// --- Helper for user input ---
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const askQuestion = (query: string) => new Promise(resolve => rl.question(query, resolve));

// --- Helper function to pretty-print console output ---
const logger = {
  log: (message: any) => console.log(message),
  error: (message: any) => console.error(message),
  step: (message: string) => console.log(`\n✅ ${message}`),
  substep: (message: string) => console.log(`   - ${message}`),
  result: (message: string) => console.log(`     -> ${message}`),
};

// --- CONFIGURATION ---
const ADMIN_PRIVATE_KEY = "0xffffda5dce3fe35e1136b5d3c424bd17f614d02124bbe9181d4c9e68d1c1dc80"; // e.g., "0x123..."
const CONTRACT_ADDRESS = "e2fb002d94700d394877fcbaaf82bcfb53c6ce6b902d32c4bdea3ccf15f4ba62";
const NETWORK = Network.TESTNET;

// Supabase Configuration
const SUPABASE_URL = "https://nzpkdhdisgcbeitsgmyr.supabase.co"; // From your project settings
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cGtkaGRpc2djYmVpdHNnbXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjM3MjgsImV4cCI6MjA3NDc5OTcyOH0.9qe2yNJ1sal5IoDju6cRuOKFY6puPpCRD-dpSg_1byY"; // From your project's API settings

// --- SETUP ---
const config = new AptosConfig({ network: NETWORK });
const aptos = new Aptos(config);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  logger.step("Starting End-to-End Test for Charity Rewards dApp with Supabase Indexer");

  if (ADMIN_PRIVATE_KEY.includes("YOUR") || SUPABASE_ANON_KEY.includes("YOUR")) {
    logger.error("ERROR: Please replace the placeholder keys (ADMIN_PRIVATE_KEY, SUPABASE_ANON_KEY) in the script.");
    rl.close();
    return;
  }

  // --- 1. Initialize Accounts & Manual Funding ---
  logger.step("Phase 1: Initializing Accounts");
  const admin: Ed25519Account = Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey(ADMIN_PRIVATE_KEY) });
  const alice: Ed25519Account = Account.generate();

  logger.substep(`Admin: ${admin.accountAddress.toString()}`);
  logger.substep(`Alice (Campaign Creator): ${alice.accountAddress.toString()}`);
  
  logger.log("\n--- ACTION REQUIRED ---");
  logger.log("Please fund the following account using the faucet at https://aptos.dev/network/faucet");
  logger.log(`Alice's Address: ${alice.accountAddress.toString()}`);
  await askQuestion("Press ENTER in this terminal once the account is funded...");

  // --- 2. On-Chain Action ---
  logger.step("Phase 2: Executing On-Chain Transaction");
  
  const campaignDesc = `My Test Campaign ${Date.now()}`;
  const txn = await aptos.transaction.build.simple({
    sender: alice.accountAddress,
    data: {
      function: `${CONTRACT_ADDRESS}::charity::create_campaign`,
      functionArguments: [campaignDesc, new U64(100000000), new U64(Math.floor(Date.now() / 1000) + 3600)],
    },
  });
  const pendingTxn = await aptos.signAndSubmitTransaction({ signer: alice, transaction: txn });
  await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
  logger.substep(`Alice created a new campaign. Txn: ${pendingTxn.hash}`);

  // --- 3. Trigger & Verify Indexer ---
  logger.step("Phase 3: Triggering and Verifying Supabase Indexer");
  logger.substep("Waiting 15 seconds for the transaction to be indexed by Aptos nodes...");
  await sleep(15000); 

  logger.substep("Manually invoking the 'aptos-indexer' Supabase function...");
  const { error: invokeError } = await supabase.functions.invoke('aptos-indexer');
  if (invokeError) throw new Error(`Failed to invoke Supabase function: ${invokeError.message}`);
  logger.result("Invoke request sent. Waiting for indexer to process...");
  
  await sleep(10000); // Give the indexer time to run and save the data

  // --- 4. Verification ---
  logger.step("Phase 4: Verifying Data in Supabase");
  logger.substep(`Querying Supabase for campaign with description: "${campaignDesc}"`);
  const { data: campaigns, error: dbError } = await supabase
    .from('campaigns')
    .select('campaign_id, creator_address')
    .eq('description', campaignDesc);

  if (dbError) throw new Error(`Supabase query failed: ${dbError.message}`);
  if (!campaigns || campaigns.length === 0) {
    throw new Error("🔴 VERIFICATION FAILED: Campaign was not found in the Supabase 'campaigns' table!");
  }
  
  logger.result(`🟢 VERIFICATION PASSED: Campaign found in Supabase!`);
  logger.log(campaigns[0]);
  
  logger.step("Test completed successfully!");
  rl.close();
}

main().catch((err) => {
  console.error(err);
  rl.close();
  process.exit(1);
});