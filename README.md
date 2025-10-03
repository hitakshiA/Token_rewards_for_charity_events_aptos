
<div align="center">
<img width="128" height="128" alt="CharityRewardsLogo" src="https://github.com/user-attachments/assets/c048ce79-bfdf-4209-8bca-14c204b214b1" />

  <h1 align="center"><b>Charity Rewards </b></h1>
  <p align="center">The Digital Garden of Giving 🌱 Try Now - <a href="https://www.charityrewards.club/">charityrewards.club</a> </p>
  <p align="center">

  </p>
  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-technology-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-project-structure">Project Structure</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

---

##   Mission & Vision

**CharityRewards** is a next-generation decentralized application built on the Aptos blockchain, designed to revolutionize philanthropy. Our mission is to foster a global community of givers by making charitable donations transparent, engaging, and rewarding. We transform every act of compassion into a tangible, beautiful experience—nurturing a personal "Digital Garden of Giving" that visually represents your impact, while rewarding your generosity with on-chain assets.

## ✨ Key Features

-   **🌍 Discover & Donate:** Browse a curated marketplace of verified charitable campaigns and donate directly from your wallet using APT.
-   ❤️ **Earn Rewards:** Receive `HEART` tokens, the protocol's utility and governance token, for every donation you make.
-   🌱 **Gamified Impact:** Watch your personal Digital Garden flourish with every contribution, providing a beautiful, visual representation of your collective impact.
-   🏆 **NFT Achievement Badges:** Unlock and collect unique, non-transferable NFT badges for reaching donation milestones and supporting specific cause categories.
-   🔐 **Staking & Governance:** Stake your `HEART` tokens to earn yield and gain voting power to influence the future direction of the platform.
-   💎 **Immersive User Experience:** A stunning, animated UI built with GSAP, Framer Motion, and Three.js for a truly engaging and memorable experience.
-   🔍 **Full Transparency:** Every donation is a verifiable transaction on the Aptos blockchain, accessible to anyone via the explorer.

## 💻 Technology Stack

This application is built with a modern, high-performance web stack:

-   **Framework:** [Vite](https://vitejs.dev/) + [React](https://reactjs.org/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a custom design system.
-   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
-   **Animation:** [GSAP (GreenSock)](https://greensock.com/gsap/) & [Framer Motion](https://www.framer.com/motion/)
-   **3D/WebGL:** [Three.js](https://threejs.org/) via [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
-   **Blockchain Integration:** [Aptos TS SDK](https://aptos.dev/sdks/ts-sdk-v2) & [Aptos Wallet Adapter](https://github.com/aptos-labs/aptos-wallet-adapter)
-   **State Management:** React Context & [TanStack Query](https://tanstack.com/query/latest)
-   **Aptos Indexer:**  [Geomi (Formerly Aptos Build)](https://geomi.dev/)
-   **Backend Storage and Edge Functions:**  [Supabase](https://www.supabase.com/)

## 💻 Infrastructure Diagram 


```mermaid
graph TB
    classDef user fill:#FF69B4,color:#fff,stroke:#fff,stroke-width:2px
    classDef frontend fill:#FFF0F5,color:#333,stroke:#FFB6C1
    classDef chain fill:#D4EDDA,color:#155724,stroke:#C3E6CB
    classDef backend fill:#D1ECF1,color:#0C5460,stroke:#BEE5EB

    User([User]):::user
    
    subgraph Frontend["React DApp"]
        UI[Pages and Components]:::frontend
        Wallet[Wallet Adapter]:::frontend
    end
    
    subgraph Blockchain["Aptos Testnet"]
        Contracts[Move Contracts]:::chain
    end
    
    subgraph Backend["Supabase"]
        DB[(Database Tables)]:::backend
        Indexer[Event Indexer]:::backend
    end

    User -->|Browse| UI
    UI -->|Fetch campaigns| DB
    UI -->|Get on-chain data| Contracts
    Contracts -->|Return state| UI
    UI -->|Display| User

    User -->|Donate| Wallet
    Wallet -->|Sign and submit| Contracts
    Contracts -->|Emit events| Indexer
    Indexer -->|Store| DB
    Contracts -->|Confirm| User

    User -->|Discuss| UI
    UI -->|Real-time sync| DB
```


## 💻 Contract Details 

Check charity-rewards-contracts folder for all move modules and deployed addresses on explorer

```mermaid
graph TB
    classDef mainModule fill:#D4EDDA,color:#155724,stroke:#28A745,stroke-width:3px
    classDef dependentModule fill:#FFF3CD,color:#856404,stroke:#FFC107,stroke-width:2px
    classDef resource fill:#D1ECF1,color:#0C5460,stroke:#17A2B8,stroke-width:2px
    classDef event fill:#F8D7DA,color:#721C24,stroke:#DC3545,stroke-width:2px
    classDef entry fill:#E7E7FF,color:#383874,stroke:#6C63FF,stroke-width:2px

    subgraph CharityModule["charity.move"]
        CharityEntry[Entry Functions]:::entry
        CharityViews[View Functions]:::entry
        
        subgraph CharityResources["Resources"]
            HeartMinter[HeartMinter<br/>mint_ref, metadata]:::resource
            Campaign[Campaign<br/>creator, goal, donations]:::resource
        end
        
        subgraph CharityEvents["Events"]
            DonationEvent[DonationEvent]:::event
            CampaignCreated[CampaignCreated]:::event
            FundsClaimed[FundsClaimed]:::event
        end
    end

    subgraph BadgesModule["badges.move"]
        BadgesEntry[Entry Functions]:::entry
        BadgesViews[View Functions]:::entry
        
        subgraph BadgesResources["Resources"]
            CampaignNFT[CampaignNFTRewards<br/>tiers, collection]:::resource
            DonorRecord[DonorNFTRecord<br/>nfts_received]:::resource
            DonationRegistry[DonationRegistry<br/>donation tracking]:::resource
        end
        
        subgraph BadgesEvents["Events"]
            NFTMinted[NFTRewardMinted]:::event
            NFTSetup[CampaignNFTSetup]:::event
            DonationTracked[DonationTracked]:::event
        end
    end

    subgraph StakingModule["staking.move"]
        StakingEntry[Entry Functions]:::entry
        StakingViews[View Functions]:::entry
        
        subgraph StakingResources["Resources"]
            StakingPool[StakingPool<br/>total_staked, rewards]:::resource
            StakedPosition[StakedPosition<br/>amount, pending_rewards]:::resource
        end
        
        subgraph StakingEvents["Events"]
            StakeEvent[StakeEvent]:::event
            UnstakeEvent[UnstakeEvent]:::event
            RewardsClaimed[RewardsClaimed]:::event
        end
    end

    subgraph GovernanceModule["governance.move"]
        GovEntry[Entry Functions]:::entry
        GovViews[View Functions]:::entry
        
        subgraph GovResources["Resources"]
            Governance[Governance<br/>proposals, count]:::resource
            Proposal[Proposal<br/>votes_for, votes_against]:::resource
        end
        
        subgraph GovEvents["Events"]
            ProposalCreated[ProposalCreated]:::event
            VoteCast[VoteCast]:::event
            ProposalExecuted[ProposalExecuted]:::event
        end
    end

    CharityModule:::mainModule
    BadgesModule:::dependentModule
    StakingModule:::dependentModule
    GovernanceModule:::dependentModule

    BadgesModule -->|Reads campaign info<br/>Uses HEART token functions| CharityModule
    StakingModule -->|Uses HEART token<br/>mint/transfer/deposit| CharityModule
    GovernanceModule -->|Checks voting power| StakingModule

    CharityEntry -.->|Emits| DonationEvent
    CharityEntry -.->|Emits| CampaignCreated
    CharityEntry -.->|Emits| FundsClaimed
    
    BadgesEntry -.->|Emits| NFTMinted
    BadgesEntry -.->|Emits| NFTSetup
    BadgesEntry -.->|Emits| DonationTracked
    
    StakingEntry -.->|Emits| StakeEvent
    StakingEntry -.->|Emits| UnstakeEvent
    StakingEntry -.->|Emits| RewardsClaimed
    
    GovEntry -.->|Emits| ProposalCreated
    GovEntry -.->|Emits| VoteCast
    GovEntry -.->|Emits| ProposalExecuted
```

## 🚀 Getting Started

Follow these instructions to set up and run the project locally. (You can also test the site online @ www.charityrewards.club

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or higher)
-   [npm](https://www.npmjs.com/) or [Bun](https://bun.sh/)
-   [Petra Wallet](https://petra.app/) browser extension (or another compatible Aptos wallet)
-   Testnet APT tokens from an [Aptos Faucet](https://aptoslabs.com/testnet-faucet).

### Installation

1.  **Clone the repository:**
2.  **Install dependencies:**
    ```sh
    npm install
    ```

### Supabase & Environment Setup (Critical)

This project requires a Supabase backend for caching and real-time features. To run the app, you must set up your local environment variables.

1.  **Create `.env.example`:**
    ```sh
    # Copy template for local use
    cp .env.example .env
    ```
2.  **Edit the new `.env` file** and paste your actual Supabase URL and Public Key. These are needed for the client-side DApp to connect to the backend.

    ```
    # Content of .env file
    VITE_SUPABASE_URL="https://odjusbwohcdxptgcekzu.supabase.co"
    VITE_SUPABASE_KEY="YOUR_ACTUAL_PUBLISHABLE_KEY" 
    ```

### Running the Development Server

Start the Vite development server. It will be accessible at `http://localhost:8080`.

```sh
npm run dev
```

## 📂 Project Structure

The frontend application is organized with a focus on scalability and maintainability.

```
/src
├── App.tsx             # Main application component with routing
├── main.tsx            # Application entry point
├── services/           # Blockchain interaction logic (e.g., aptos.ts)
├── components/
│   ├── ui/             # Reusable, unstyled UI components (from shadcn/ui)
│   └── (feature)/      # Complex components like DonationModal.tsx
├── pages/              # Each route's main component (e.g., Marketplace.tsx)
├── contexts/           # Global state providers (ThemeContext, WalletContext)
├── hooks/              # Custom React hooks (e.g., use-mobile.tsx)
├── lib/                # Utility functions and constants (utils.ts, campaigns.tsx)
├── types.ts            # Global TypeScript type definitions
└── index.css           # Global styles & Tailwind CSS layers
```

## 🤝 Contributing

Contributions are welcome and essential for the growth of CharityRewards. Whether you're fixing a bug, proposing a new feature, or improving documentation, your help is valued.

Please follow these steps to contribute:
1.  **Fork the repository.**
2.  Create a new branch: `git checkout -b feature/your-feature-name`
3.  Make your changes and commit them with a descriptive message.
4.  Push to your fork: `git push origin feature/your-feature-name`
5.  Open a **Pull Request** and describe your changes in detail.

Please read our `CONTRIBUTING.md` for more details on our code of conduct and the process for submitting pull requests.

Demo video link - https://drive.google.com/file/d/1xRf65PrSTGOnYUwyjgBSgAqaAjkYvowe/view?usp=sharing

## ⚖️ License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

