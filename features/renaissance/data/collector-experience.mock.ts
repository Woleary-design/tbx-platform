const photos = {
  heroCabinet: "lego-cabinet",
  retiredIcons: "lego-retired-icons",
  sealedBox: "lego-sealed-box",
  minifigureVault: "lego-minifigure-vault",
  modularStreet: "lego-modular-street",
  technicDisplay: "lego-technic-display",
  castleArchive: "lego-castle-archive",
};

export const homeHero = {
  eyebrow: "Private LEGO collector home",
  title: "Own with confidence. Trade with trust.",
  description:
    "A calm home for rare LEGO sets, verified reputation and TBX Secure transactions.",
  imageLabel: "Curated LEGO collector cabinet",
  imageDetail: "Retired sets, minifigure vaults and sealed grails with protected-trade readiness in one view.",
  imageSrc: photos.heroCabinet,
  primarySignal: "TBX Secure active",
  secondarySignal: "Trust 96",
};

export const collectionSummary = {
  value: "$128,400",
  change: "+8.4% this quarter",
  itemCount: "47 documented LEGO pieces",
  insured: "$142,000 insured value",
};

export const trustStatus = {
  score: 96,
  level: "Premier Collector",
  detail: "Identity, address and payout checks current",
};

export const watchlistOpportunities = [
  {
    title: "Retired Modular Street Corner",
    price: "$2,850",
    signal: "12% below six-month benchmark",
    category: "Retired LEGO Icons",
  },
  {
    title: "Sealed Collector Space Cruiser",
    price: "$940",
    signal: "Verified seller reduced price today",
    category: "Sealed Box Grails",
  },
];

export const marketMovers = [
  {
    title: "Retired Modular Buildings",
    movement: "+6.8%",
    detail: "Sealed examples tightened after two verified sales.",
  },
  {
    title: "Castle Archive Lots",
    movement: "+4.1%",
    detail: "Complete boxed sets are moving faster across private collectors.",
  },
  {
    title: "Loose Minifigure Lots",
    movement: "-3.2%",
    detail: "Short-term softness created a watchlist opportunity.",
  },
];

export const recentActivity = [
  "Retired Modular seller dispatch proof verified.",
  "Sealed Space Cruiser provenance note added to Vault.",
  "Minifigure lot watchlist threshold crossed below target range.",
  "Castle Archive entered TBX Secure inspection window.",
];

export const recommendedAcquisitions = [
  {
    id: "retired-modular-street",
    title: "Retired Modular Street Corner",
    price: "$580",
    condition: "Factory sealed, sharp corners",
    category: "Retired LEGO Icons",
    seller: "Maya Chen",
    trustScore: 94,
    secure: true,
    imageSrc: photos.retiredIcons,
  },
  {
    id: "sealed-space-cruiser",
    title: "Sealed Collector Space Cruiser",
    price: "$940",
    condition: "Sealed first owner",
    category: "Sealed Box Grails",
    seller: "Andre Singh",
    trustScore: 91,
    secure: true,
    imageSrc: photos.sealedBox,
  },
  {
    id: "rare-minifigure-vault",
    title: "Rare Minifigure Vault Lot",
    price: "$470",
    condition: "Complete with accessories",
    category: "Minifigure Vault",
    seller: "Warren O'Leary",
    trustScore: 96,
    secure: true,
    imageSrc: photos.minifigureVault,
  },
];

export const marketplaceListings = [
  ...recommendedAcquisitions,
  {
    id: "sealed-modular-street",
    title: "Sealed Modular Street Archive",
    price: "$2,850",
    condition: "Factory sealed, collector stored",
    category: "Modular Buildings",
    seller: "Elliot Venter",
    trustScore: 97,
    secure: true,
    imageSrc: photos.modularStreet,
  },
  {
    id: "technic-display-car",
    title: "Technic Display Car Edition",
    price: "$260",
    condition: "New open box, bags sealed",
    category: "Technic & Display",
    seller: "Nadia Jacobs",
    trustScore: 89,
    secure: true,
    imageSrc: photos.technicDisplay,
  },
  {
    id: "castle-archive-lot",
    title: "Castle Archive Complete Lot",
    price: "$1,120",
    condition: "Complete with manuals",
    category: "Castle Archive",
    seller: "Maya Chen",
    trustScore: 94,
    secure: true,
    imageSrc: photos.castleArchive,
  },
];
