const photos = {
  heroCabinet: "https://source.unsplash.com/1600x1100/?museum,display,cabinet,collectibles",
  townhouse: "https://source.unsplash.com/1000x750/?architectural-model,museum",
  lighthouse: "https://source.unsplash.com/1000x750/?lighthouse,architecture,model",
  castle: "https://source.unsplash.com/1000x750/?castle,architecture,model",
  museum: "https://source.unsplash.com/1000x750/?museum,architecture,model",
  conservatory: "https://source.unsplash.com/1000x750/?botanical,conservatory,architecture",
  station: "https://source.unsplash.com/1000x750/?railway-station,architecture",
};

export const homeHero = {
  eyebrow: "Private collector home",
  title: "Own with confidence. Trade with trust.",
  description:
    "A calm home for exceptional pieces, verified reputation and TBX Secure transactions.",
  imageLabel: "Museum-lit architectural collection",
  imageDetail: "Original brick-built icons, provenance notes and protected-trade readiness in one view.",
  imageSrc: photos.heroCabinet,
  primarySignal: "TBX Secure active",
  secondarySignal: "Trust 96",
};

export const collectionSummary = {
  value: "$128,400",
  change: "+8.4% this quarter",
  itemCount: "47 documented pieces",
  insured: "$142,000 insured value",
};

export const trustStatus = {
  score: 96,
  level: "Premier Collector",
  detail: "Identity, address and payout checks current",
};

export const watchlistOpportunities = [
  {
    title: "Harbor Lighthouse Atelier",
    price: "$2,850",
    signal: "12% below six-month benchmark",
    category: "Architectural Builds",
  },
  {
    title: "Walnut Observatory Edition",
    price: "$940",
    signal: "Verified seller reduced price today",
    category: "Limited Construction",
  },
];

export const marketMovers = [
  {
    title: "European Townhouse Series",
    movement: "+6.8%",
    detail: "Sealed examples tightened after two verified sales.",
  },
  {
    title: "Hilltop Castle Builds",
    movement: "+4.1%",
    detail: "Complete boxed sets are moving faster across private collectors.",
  },
  {
    title: "Civic Museum Editions",
    movement: "-3.2%",
    detail: "Short-term softness created a watchlist opportunity.",
  },
];

export const recentActivity = [
  "Atelier Row seller dispatch proof verified.",
  "Walnut Observatory provenance note added to Vault.",
  "Civic Museum watchlist threshold crossed below target range.",
  "Harbor Lighthouse entered TBX Secure inspection window.",
];

export const recommendedAcquisitions = [
  {
    id: "european-townhouse",
    title: "European Townhouse Archive",
    price: "$580",
    condition: "Factory sealed",
    category: "Architectural Builds",
    seller: "Maya Chen",
    trustScore: 94,
    secure: true,
    imageSrc: photos.townhouse,
  },
  {
    id: "harbor-lighthouse",
    title: "Harbor Lighthouse Atelier",
    price: "$940",
    condition: "Sealed first owner",
    category: "Limited Construction",
    seller: "Andre Singh",
    trustScore: 91,
    secure: true,
    imageSrc: photos.lighthouse,
  },
  {
    id: "hilltop-castle",
    title: "Hilltop Castle Founder's Box",
    price: "$470",
    condition: "New open box",
    category: "Castle Architecture",
    seller: "Warren O'Leary",
    trustScore: 96,
    secure: true,
    imageSrc: photos.castle,
  },
];

export const marketplaceListings = [
  ...recommendedAcquisitions,
  {
    id: "civic-museum",
    title: "Civic Museum Corner Edition",
    price: "$2,850",
    condition: "Used complete",
    category: "Museum Architecture",
    seller: "Elliot Venter",
    trustScore: 97,
    secure: true,
    imageSrc: photos.museum,
  },
  {
    id: "botanical-conservatory",
    title: "Botanical Conservatory Study",
    price: "$260",
    condition: "Factory sealed",
    category: "Glasshouse Builds",
    seller: "Nadia Jacobs",
    trustScore: 89,
    secure: true,
    imageSrc: photos.conservatory,
  },
  {
    id: "railway-station",
    title: "Old Town Railway Station",
    price: "$1,120",
    condition: "Sealed with shipper",
    category: "Transport Architecture",
    seller: "Maya Chen",
    trustScore: 94,
    secure: true,
    imageSrc: photos.station,
  },
];
