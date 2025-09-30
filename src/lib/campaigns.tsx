// src/lib/campaigns.ts

import React from 'react';

// This structure now includes a plain-text 'summary' for lists
// and a rich JSX 'description' for detail pages.
export const LIVE_CAMPAIGNS = [
  {
    eventAddress: "0x0f7b3c61c513f7d20d2c113da3f1385444d0ebb24a9c32c54599ea030f193148",
    charityName: "Ocean Revival Foundation",
    summary: "Fund the cultivation and out-planting of heat-resistant coral fragments to restore the critically bleached Mesoamerican Reef in Belize, reviving a vital marine ecosystem.",
    description: (
      <div className="space-y-4 text-lg">
        <p>The vibrant colors of the Mesoamerican Reef near Turneffe Atoll, Belize, are fading. Rising sea temperatures have triggered mass coral bleaching events, leaving behind skeletal remains where a bustling metropolis of marine life once thrived. This project is an emergency intervention.</p>
        <p className="font-semibold text-primary">Our mission is to out-plant 5,000 fragments of genetically diverse, heat-resistant Acropora cervicornis (Staghorn) and Acropora palmata (Elkhorn) corals across a 1,000 square meter area.</p>
        
        <h3 className="font-bold text-xl pt-4">A Story from the Reef</h3>
        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">"I've been a dive master here for 20 years," says local partner, Elena Gomez. "I remember when these reefs were a rainbow. Now... it's quiet. Restoring the coral isn't just about the fish; it's about restoring the heart of our community, our culture. It's about giving our children the same wonder we had."</blockquote>
        
        <h3 className="font-bold text-xl pt-4">How Your Donation Will Be Used:</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>$25:</strong> Cultivates and maintains one coral fragment in our underwater nursery for a year until it's ready for out-planting.</li>
          <li><strong>$100:</strong> Buys a set of specialized tools (epoxy, hammers, tags) for a local diver to securely plant 20 coral fragments.</li>
          <li><strong>$500:</strong> Sponsors a full day of out-planting work for a two-person dive team, covering boat fuel, dive tanks, and wages.</li>
          <li><strong>$2,500:</strong> Funds a monitoring and maintenance dive to clean algae and predators from 500 newly planted corals, crucial for their survival.</li>
        </ul>
        <p className="pt-4 text-sm text-muted-foreground">Learn more about our methodology from our research partners at the <a href="https://www.fragments-of-hope.org/" target="_blank" rel="noopener noreferrer" className="underline text-primary">Fragments of Hope</a> coral restoration project. All donations are tracked on-chain for full transparency.</p>
      </div>
    ),
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    milestones: [
        { goalAmount: 10000, bonusReward: 100, isClaimed: false }, { goalAmount: 25000, bonusReward: 250, isClaimed: false },
        { goalAmount: 40000, bonusReward: 400, isClaimed: false }, { goalAmount: 50000, bonusReward: 500, isClaimed: false },
    ]
  },
  {
    eventAddress: "0xbb0ed9eb30fec9d3898952f448b828695940282c6782cb1fdc7d46edf7e51ec6",
    charityName: "Forest Guardians Alliance",
    summary: "Empower local indigenous communities in the Ecuadorian Amazon to act as official Forest Guardians, funding patrols, satellite monitoring, and reforestation of illegally cleared land.",
    description: (
       <div className="space-y-4 text-lg">
        <p>In the Yasuní region of the Ecuadorian Amazon—one of the most biodiverse places on Earth—the roar of chainsaws is a constant threat. Illegal logging operations are encroaching on ancestral lands, destroying irreplaceable habitats for jaguars, monkeys, and thousands of undocumented species.</p>
        <p className="font-semibold text-primary">This project isn't about sending outsiders; it's about empowering those who have protected this land for centuries. We are funding the Waorani community to become official, equipped Forest Guardians.</p>
        
        <h3 className="font-bold text-xl pt-4">The Guardian's Watch</h3>
        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">"The forest speaks to us. It tells us when it is sick," says Nemonte Nenquimo, a community leader. "With the GPS and drones, we can show the government and the world what is happening. This isn't just a donation; it's a tool for justice. It is our voice."</blockquote>
        
        <h3 className="font-bold text-xl pt-4">Breakdown of Funds:</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>$50:</strong> Provides a waterproof field kit (first aid, compass, boots) for one Forest Guardian.</li>
          <li><strong>$300:</strong> Covers the cost of a handheld GPS unit with satellite messaging for a patrol team to document illegal activity and call for support.</li>
          <li><strong>$1,000:</strong> Funds one month of satellite imagery analysis from <a href="https://www.planet.com/" target="_blank" rel="noopener noreferrer" className="underline text-primary">Planet Labs</a> to detect new deforestation hotspots in real-time.</li>
          <li><strong>$5,000:</strong> Supports the establishment of a native sapling nursery to grow 10,000 trees for reforesting cleared areas.</li>
        </ul>
        <p className="pt-4 text-sm text-muted-foreground">View our partnership agreement with the <a href="https://ceibo.org/" target="_blank" rel="noopener noreferrer" className="underline text-primary">Ceibo Alliance</a>. Every dollar contributes to the direct protection of 500 acres.</p>
      </div>
    ),
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    milestones: [
        { goalAmount: 15000, bonusReward: 150, isClaimed: false }, { goalAmount: 30000, bonusReward: 300, isClaimed: false },
        { goalAmount: 50000, bonusReward: 500, isClaimed: false }, { goalAmount: 75000, bonusReward: 750, isClaimed: false },
    ]
  },
    {
    eventAddress: "0xd87abc114bf975be1df0f36c440b9a5f6045db12411c35c47f524fc907e5cbae",
    charityName: "Urban Wildlife Rescue",
    summary: "Fund a new state-of-the-art wildlife rehabilitation center in downtown Chicago, providing critical care for injured urban animals and promoting community coexistence.",
    description: (
       <div className="space-y-4 text-lg">
        <p>As Chicago's urban footprint expands, encounters between people and wildlife—raccoons hit by cars, birds of prey colliding with skyscrapers, opossums displaced by construction—are increasing dramatically. Local animal control is overwhelmed, lacking the specialized facilities to provide long-term care.</p>
        <p className="font-semibold text-primary">This campaign will fund the construction and initial staffing of a dedicated Urban Wildlife Rehabilitation Center, the first of its kind in the city center.</p>
        
        <h3 className="font-bold text-xl pt-4">A Second Chance for a Peregrine</h3>
        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">"We got a call about a peregrine falcon with a broken wing downtown. We stabilized it, but had to drive it three hours to the nearest proper facility," says Dr. Anya Sharma, a local vet. "By the time it got there, the stress had complicated the injury. A dedicated local center means we can provide immediate, life-saving care."</blockquote>
        
        <h3 className="font-bold text-xl pt-4">Your Impact by the Dollar:</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>$35:</strong> Covers the cost of a full medical intake exam and x-rays for one injured animal.</li>
          <li><strong>$150:</strong> Provides a week's worth of specialized formula and food for a litter of orphaned raccoons or squirrels.</li>
          <li><strong>$750:</strong> Funds the construction of one custom-built outdoor pre-release enclosure to help animals reacclimatize.</li>
          <li><strong>$3,000:</strong> Equips a full veterinary triage station with an anesthesia machine and monitoring equipment.</li>
        </ul>
        <p className="pt-4 text-sm text-muted-foreground">This project is in partnership with the <a href="https://www.wildliferescuechicago.org/" target="_blank" rel="noopener noreferrer" className="underline text-primary">Chicago Wildlife Watch</a> and follows guidelines from the National Wildlife Rehabilitators Association.</p>
      </div>
    ),
    imageUrl: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800",
    milestones: [
        { goalAmount: 25000, bonusReward: 250, isClaimed: false }, { goalAmount: 50000, bonusReward: 500, isClaimed: false },
        { goalAmount: 80000, bonusReward: 800, isClaimed: false }, { goalAmount: 120000, bonusReward: 1200, isClaimed: false },
    ]
  },
  {
    eventAddress: "0x494b9f3bd9c381072a678cae3161c86503b41cb27effd2327a88e35fcef69705",
    charityName: "Future Farmers Initiative",
    summary: "Build food security in sub-Saharan Africa by training 500 young farmers in climate-resilient agriculture, providing workshops, drought-resistant seeds, and essential tools.",
    description: (
       <div className="space-y-4 text-lg">
        <p>In the drought-prone regions of northern Kenya, traditional farming methods are failing in the face of unpredictable weather and degraded soil. This leaves communities vulnerable to food insecurity and forces young people to abandon their homes for uncertain work in cities.</p>
        <p className="font-semibold text-primary">The Future Farmers Initiative provides an intensive, 3-month training program for 500 young adults (ages 18-25) in sustainable, climate-smart agriculture to build resilient local food economies from the ground up.</p>
        
        <h3 className="font-bold text-xl pt-4">From Barren Land to Bountiful Harvest</h3>
        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">"Before the program, my family's plot of land was dry dust. We were lucky to get one small harvest a year," explains Kibet, a 22-year-old graduate of our pilot program. "They taught us about Zai pits for water retention and intercropping with legumes. This year, for the first time, we have enough to eat and extra to sell at the market. I am not just a farmer; I am a provider."</blockquote>
        
        <h3 className="font-bold text-xl pt-4">How Donations Create a Future:</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>$40:</strong> Provides one student with a complete starter kit of drought-resistant seeds (sorghum, cowpea) and hand tools.</li>
          <li><strong>$200:</strong> Sponsors one student's full enrollment in the 3-month hands-on training program, including all materials.</li>
          <li><strong>$1,500:</strong> Funds the construction of a small-scale rainwater harvesting and drip irrigation system for a community demonstration plot.</li>
          <li><strong>$6,000:</strong> Covers all costs for a full cohort of 30 students, creating a new generation of climate-resilient farmers.</li>
        </ul>
        <p className="pt-4 text-sm text-muted-foreground">Our curriculum is developed with guidance from the <a href="https://www.worldagroforestry.org/" target="_blank" rel="noopener noreferrer" className="underline text-primary">World Agroforestry Centre</a> to ensure best practices.</p>
      </div>
    ),
    imageUrl: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
    milestones: [
        { goalAmount: 10000, bonusReward: 100, isClaimed: false }, { goalAmount: 20000, bonusReward: 200, isClaimed: false },
        { goalAmount: 30000, bonusReward: 300, isClaimed: false }, { goalAmount: 42000, bonusReward: 420, isClaimed: false },
    ]
  },
  {
    eventAddress: "0xf468b2cb94dbe2420f264fa281971eb59e59e1b90dc17dbe982c05a30c8e2cf7",
    charityName: "Solar Schools Project",
    summary: "Install independent solar panel and battery systems in 15 remote schools in the Guatemalan highlands, powering lights and computers for over 2,000 students for the first time.",
    description: (
       <div className="space-y-4 text-lg">
        <p>In the Cuchumatanes mountains of Guatemala, daylight dictates education. Once the sun sets, homework is impossible. The lack of electricity means no computers, no internet, and no modern educational tools, widening the gap between rural students and the rest of the world.</p>
        <p className="font-semibold text-primary">This project will equip 15 off-grid schools with complete, durable solar power systems, each including panels, a battery bank, and an inverter, providing reliable electricity for lighting and a small computer lab.</p>
        
        <h3 className="font-bold text-xl pt-4">A Light in the Darkness</h3>
        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">"My daughter, Ana, used to rush home to finish her reading before it got dark," says Maria, a mother from the village of Chajul. "Now, with the lights at school, she attends evening study groups. She saw a map of the world on a computer for the first time last week. It is not just light you are giving us; it is the entire world."</blockquote>
        
        <h3 className="font-bold text-xl pt-4">Powering Education:</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>$75:</strong> Purchases a high-efficiency LED light fixture to illuminate a classroom.</li>
          <li><strong>$400:</strong> Funds one complete student computer workstation (a refurbished, low-power desktop).</li>
          <li><strong>$2,000:</strong> Covers the cost of a deep-cycle battery bank to store power for evening use and cloudy days.</li>
          <li><strong>$4,500:</strong> Funds the entire solar installation for one school, impacting over 100 students immediately.</li>
        </ul>
        <p className="pt-4 text-sm text-muted-foreground">We partner with local technicians for installation and maintenance, following standards set by <a href="https://www.seia.org/" target="_blank" rel="noopener noreferrer" className="underline text-primary">SEIA</a>. Track the installation progress for each school on our project blog.</p>
      </div>
    ),
    imageUrl: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800",
    milestones: [
        { goalAmount: 15000, bonusReward: 150, isClaimed: false }, { goalAmount: 30000, bonusReward: 300, isClaimed: false },
        { goalAmount: 50000, bonusReward: 500, isClaimed: false }, { goalAmount: 65000, bonusReward: 650, isClaimed: false },
    ]
  },
];