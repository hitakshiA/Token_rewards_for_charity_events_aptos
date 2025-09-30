
<div align="center">
  <h1 align="center"><b>The CharityRewards Protocol</b></h1>
  <p align="center">On-Chain Philanthropy on the Aptos Blockchain</p>
  <p align="center">
    <a href="#"><img alt="Audit Status" src="https://img.shields.io/badge/Audit-Pending-yellow?style=for-the-badge&logo=shield"></a>
    <a href="#"><img alt="Move Version" src="https://img.shields.io/badge/Move-Aptos%20v1.8-blue?style=for-the-badge&logo=aptos"></a>
  </p>
  <p align="center">
    <a href="#-architecture-overview">Architecture</a> •
    <a href="#-deployed-contracts">Deployed Contracts</a> •
    <a href="#-development-and-testing">Development</a> •
    <a href="#-security">Security</a>
  </p>
</div>

---

## 📜 Overview

This repository contains the core Move smart contracts for the **CharityRewards Protocol**, a decentralized application built on the Aptos blockchain. These contracts form the on-chain backbone for creating charitable campaigns, processing transparent donations, and managing the protocol's tokenomics and governance.

Our architecture is designed to be modular, secure, and extensible, leveraging the powerful Object Model of the Aptos framework to ensure true digital asset ownership and composability.

## 🏗️ Architecture Overview

The protocol is composed of four primary Move modules, each deployed under the same address and designed to work in concert.

### 1. `charity.move`
The core module for creating and managing donation campaigns. It serves as the foundational layer of the protocol.

-   **Purpose:** Enables users to create campaigns as on-chain `Object`s, accept `AptosCoin` donations, and allows campaign creators to claim funds after a successful campaign.
-   **Key Structs:**
    -   `Campaign`: An object that holds all data for a specific fundraising campaign (goal, deadline, total donated).
    -   `HeartMinter`: A capability resource for minting the `HEART` token.
-   **Core Functions:**
    -   `create_campaign`: Deploys a new `Campaign` object to the blockchain. [View on Explorer](https://explorer.aptoslabs.com/account/e2fb002d94700d394877fcbaaf82bcfb53c6ce6b902d32c4bdea3ccf15f4ba62/modules/code/charity?network=testnet).
    -   `donate`: Transfers APT to a campaign object and mints `HEART` tokens for the donor.
    -   `claim_funds`: Allows the campaign creator to withdraw the collected APT if the goal is met.

### 2. `badges.move`
The module for creating and distributing gamified NFT achievement badges.

-   **Purpose:** Adds a layer of recognition and engagement by rewarding donors with non-transferable NFTs based on their contribution levels and history.
-   **Key Structs:**
    -   `CampaignNFTRewards`: Stores the NFT collection metadata and reward tiers for a specific campaign.
    -   `DonationRegistry`: A global registry that tracks cumulative donation amounts for each user per campaign, enabling tiered rewards.
    -   `DonorNFTRecord`: A resource on the donor's account that logs all badges they have received.
-   **Core Functions:**
    -   `setup_campaign_nft_rewards`: Called by a campaign creator to define the NFT tiers for their campaign.
    -   `track_donation`: An internal-facing function to log donation amounts to the registry.
    -   `claim_donation_nft`: Allows a donor to mint the highest-tiered NFT they qualify for. [View on Explorer](https://explorer.aptoslabs.com/account/e2fb002d94700d394877fcbaaf82bcfb53c6ce6b902d32c4bdea3ccf15f4ba62/modules/code/badges?network=testnet).

### 3. `staking.move`
The module for managing the staking of `HEART` utility tokens.

-   **Purpose:** Provides utility for the `HEART` token by allowing users to stake their tokens to earn yield and gain voting power in governance.
-   **Key Structs:**
    -   `StakingPool`: A global resource that tracks the total amount of staked tokens.
    -   `StakedPosition`: A resource on the staker's account that tracks their individual stake amount and pending rewards.
-   **Core Functions:**
    -   `stake`: Locks a user's `HEART` tokens in the contract.
    -   `unstake`: Unlocks a user's `HEART` tokens and claims their pending rewards.
    -   `claim_rewards`: Allows a user to claim their accumulated rewards without unstaking.
    -   `get_voting_power (view)`: A crucial view function used by the `governance` module to determine a user's influence. [View on Explorer](https://explorer.aptoslabs.com/account/e2fb002d94700d394877fcbaaf82bcfb53c6ce6b902d32c4bdea3ccf15f4ba62/modules/code/staking?network=testnet).

### 4. `governance.move`
A lightweight, on-chain governance system for decentralized decision-making.

-   **Purpose:** Enables `HEART` token stakers to create proposals and vote on the future direction of the CharityRewards protocol.
-   **Key Structs:**
    -   `Governance`: A global resource holding the list of all proposals in a `SmartTable`.
    -   `Proposal`: A struct containing the details of a single proposal, including vote counts and voter lists.
-   **Core Functions:**
    -   `create_proposal`: Allows a user with sufficient voting power to submit a new proposal.
    -   `vote`: Allows stakers to cast their votes (weighted by their `get_voting_power` from the `staking` module).
    -   `get_proposal (view)`: Returns the current status and details of a proposal. [View on Explorer](https://explorer.aptoslabs.com/account/e2fb002d94700d394877fcbaaf82bcfb53c6ce6b902d32c4bdea3ccf15f4ba62/modules/code/governance?network=testnet).

## 📍 Deployed Contracts

The protocol is deployed on the Aptos Testnet under a single, unified address. All modules (`charity`, `badges`, `staking`, `governance`) can be found under this account.

-   **Testnet Address (`charity_addr`):** [`0xe2fb002d94700d394877fcbaaf82bcfb53c6ce6b902d32c4bdea3ccf15f4ba62`](https://explorer.aptoslabs.com/account/e2fb002d94700d394877fcbaaf82bcfb53c6ce6b902d32c4bdea3ccf15f4ba62?network=testnet)
-   **Mainnet Address:** TBD (Deployment pending audit completion)

You can view the full source code of all deployed modules directly on the explorer.

## 🛠️ Local Development and Testing

### Prerequisites

-   Install the [Aptos CLI](https://aptos.dev/cli-tools/aptos-cli/install-aptos-cli).
-   Set up a local profile: `aptos init`.

### Building the Project

Compile the Move modules to check for errors and generate ABIs and other metadata.

```sh
aptos move compile
```

### Running Tests

Execute the comprehensive suite of on-chain unit tests to ensure contract integrity.

```sh
aptos move test
```

### Local Deployment

To deploy the contracts to a local testnet, follow these steps:
1.  Run a local node: `aptos node run-local-testnet --with-faucet`
2.  Create a local profile: `aptos init --network local`
3.  Fund your account: `aptos account fund-with-faucet --account default`
4.  Publish the contracts: `aptos move publish --named-addresses charity_addr=default`

## 🛡️ Security

Security is paramount. The contracts in this repository are developed with the highest standards in mind, but they are currently **unaudited**. Do not use in a production environment with real funds until a full, professional security audit has been completed.

-   **Internal Review:** All modules have undergone extensive internal peer review and testing. Test coverage reports can be found in the `/tests` directory.
-   **External Audit:** An external security audit is planned before any mainnet deployment. The audit report will be made public here.
-   **Reporting Vulnerabilities:** To report a security vulnerability, please follow the guidelines in our `SECURITY.md` file. We operate a bug bounty program for critical disclosures.

## 🤝 Contributing

We welcome contributions from the community to improve the CharityRewards protocol. If you're interested in contributing to the smart contracts, please join our [Discord](https://discord.gg/your-invite) and check out the `#protocol-development` channel to discuss potential changes, optimizations, and new features.

## ⚖️ License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

