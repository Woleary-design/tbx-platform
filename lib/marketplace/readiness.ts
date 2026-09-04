export const marketplaceReadiness = {
  paymentsLive: process.env.TBX_PAYMENTS_LIVE === "true",
  courierQuotesLive:
    process.env.TBX_COURIER_QUOTES_LIVE === "true" &&
    Boolean(process.env.SHIPLOGIC_API_TOKEN?.trim()) &&
    Number(process.env.SHIPLOGIC_PROVIDER_ID) > 0 &&
    Number(process.env.SHIPLOGIC_ACCOUNT_ID) > 0,
  requireVerifiedSellers: process.env.TBX_REQUIRE_VERIFIED_SELLERS === "true",
} as const;
