export const marketplaceReadiness = {
  paymentsLive: process.env.TBX_PAYMENTS_LIVE === "true",
  courierQuotesLive: process.env.TBX_COURIER_QUOTES_LIVE === "true",
  requireVerifiedSellers: process.env.TBX_REQUIRE_VERIFIED_SELLERS === "true",
} as const;
