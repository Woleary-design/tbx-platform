# ADR-001: Platform Architecture

## Status
Accepted

## Context
The Block Exchange (TBX) is being built as a trusted operating system for collectors, not merely a classifieds marketplace.

The platform must support:

- Secure collector identity
- Trusted seller reputation
- Listings and discovery
- Orders
- Payments
- Escrow-style transaction control
- Shipping integration
- Disputes
- Future Vault and market intelligence features

Because TBX is trust-first, the architecture must prioritise security, auditability, modularity, and maintainability.

## Decision
TBX will use a modular service architecture inside a single primary application repository.

Initial stack:

- Frontend: Next.js, React, TypeScript
- Styling: Tailwind CSS and reusable UI components
- Backend: Supabase
- Database: PostgreSQL
- Authentication: Supabase Auth
- Storage: Supabase Storage
- Hosting: Vercel

Core services will be separated by domain:

- Identity Service
- Profile Service
- Listing Service
- Search Service
- Trust Service
- Order Service
- Payment Service
- Escrow Service
- Shipping Service
- Payout Service
- Notification Service
- Dispute Service
- Vault Service

Payment and shipping integrations must be provider-agnostic. Marketplace logic should never depend directly on a specific courier or payment gateway.

## Principles

1. Trust is the product.
2. Every critical action must be auditable.
3. Users must never be able to manipulate trust, payment, escrow, payout, or order states from the client.
4. Domain services own their own rules.
5. External providers must be wrapped in adapters.
6. The platform must be category-agnostic so TBX can expand beyond LEGO into other collectibles.

## Consequences

### Benefits
- Easier to test business rules.
- Easier to replace payment or courier providers.
- Easier to expand into future categories and services.
- Strong audit trail for disputes and support.
- Better long-term maintainability.

### Trade-offs
- Slightly more upfront architecture work.
- More discipline required when adding features.
- Developers must follow domain boundaries.

## Notes
This architecture is intended to support TBX from MVP through private beta, public beta, and future platform expansion.
