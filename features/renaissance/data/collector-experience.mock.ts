const photos = {
  heroCabinet: "https://cdn.shopify.com/s/files/1/0637/3277/7049/files/e3154f8b92295a855cf4f008ed904253_272927c3-cb13-4466-89e9-99b74b264617.jpg?v=1753839137",
  ucsGrail: "lego-ucs-grail",
  modularWatch: "lego-2026-modular-watch",
  smartPlay: "lego-smart-play-era",
  blacktronReturn: "lego-blacktron-return",
  sealedIcons: "lego-sealed-icons",
  minifigureVault: "lego-minifigure-vault",
  tudorCorner: "lego-tudor-corner",
};

export const homeHero = {
  eyebrow: "Private LEGO collector home",
  title: "Own with confidence. Trade with trust.",
  description:
    "A calm home for rare LEGO sets, verified reputation and TBX Secure transactions.",
  imageLabel: "Premium LEGO collector cabinet",
  imageDetail: "Real display-room energy for serious LEGO collectors: lit cabinets, protected value and seller trust at the centre.",
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
    title: "UCS Death Star 75419 Lead",
    price: "$999 MSRP signal",
    signal: "High-intent collector demand around the 2025 flagship release",
    category: "UCS Display Grails",
  },
  {
    title: "2026 Modular Street Watch",
    price: "$240-$320 range",
    signal: "Early watchlist activity around next-cycle modular inventory",
    category: "2026 Modular Watch",
  },
];

export const marketMovers = [
  {
    title: "UCS Display Grails",
    movement: "+9.1%",
    detail: "Large 18+ display sets are pulling watchlist attention after the Death Star reveal.",
  },
  {
    title: "Classic Space / Blacktron",
    movement: "+7.4%",
    detail: "Return-era space nostalgia is lifting sealed and complete archive lots.",
  },
  {
    title: "2026 Modular Watch",
    movement: "+5.8%",
    detail: "Collectors are tracking launch-window modular pricing before supply settles.",
  },
];

export const recentActivity = [
  "UCS Death Star 75419 watchlist threshold crossed above target demand.",
  "Blacktron return listing moved into TBX Secure verification.",
  "2026 modular allocation added to a private vault watchlist.",
  "Sealed 18+ Icons listing received new box-condition photos.",
];

export const recommendedAcquisitions = [
  {
    id: "ucs-death-star-75419-lead",
    title: "UCS Death Star 75419 Lead",
    price: "$999",
    condition: "Launch-window watch, verified seller",
    category: "UCS Display Grails",
    seller: "Maya Chen",
    trustScore: 94,
    secure: true,
    imageSrc: photos.ucsGrail,
  },
  {
    id: "shopping-street-2026-watch",
    title: "2026 Modular Street Watch",
    price: "$285",
    condition: "New cycle, allocation tracked",
    category: "2026 Modular Watch",
    seller: "Andre Singh",
    trustScore: 91,
    secure: true,
    imageSrc: photos.modularWatch,
  },
  {
    id: "blacktron-renegade-return",
    title: "Blacktron Return Archive",
    price: "$210",
    condition: "Sealed nostalgia pick",
    category: "Classic Space Return",
    seller: "Warren O'Leary",
    trustScore: 96,
    secure: true,
    imageSrc: photos.blacktronReturn,
  },
];

export const marketplaceListings = [
  ...recommendedAcquisitions,
  {
    id: "smart-play-starfighter-lot",
    title: "Smart Play Starfighter Lot",
    price: "$180",
    condition: "New tech-era set, sealed",
    category: "Smart Play Era",
    seller: "Elliot Venter",
    trustScore: 97,
    secure: true,
    imageSrc: photos.smartPlay,
  },
  {
    id: "sealed-18-icons-allocation",
    title: "Sealed 18+ Icons Allocation",
    price: "$640",
    condition: "Factory sealed, collector stored",
    category: "Sealed 18+ Icons",
    seller: "Nadia Jacobs",
    trustScore: 89,
    secure: true,
    imageSrc: photos.sealedIcons,
  },
  {
    id: "tudor-corner-10350",
    title: "Tudor Corner 10350",
    price: "$229",
    condition: "New modular, box protected",
    category: "Modular Buildings",
    seller: "Maya Chen",
    trustScore: 94,
    secure: true,
    imageSrc: photos.tudorCorner,
  },
];