# TBX sandbox acceptance — 5 October 2026

- User confirmed sign-up/login and a buyer reservation followed by seller availability confirmation.
- Reserved listing read access tested in the sandbox: buyer and seller each see one record; unrelated and anonymous users see zero.
- Listing details fix and callback bypass support published on fix/auth-launch-checks; production unchanged.
- Ten automated auth/payment tests, TypeScript and production build passed.
- Saved callback bypass restricted to Preview on fix/auth-launch-checks.
- Deployed sandbox-readiness endpoint confirmed configuration, isolated database and callback reachability while payments disabled.
- Enabled TBX_PAYFAST_SANDBOX_ENABLED only for this branch; rebuild triggered by this commit.

Remaining acceptance: invalid notification must be rejected with Invalid signature; buyer must complete a fresh PayFast sandbox checkout before its deadline, and the provider callback must record a complete sandbox attempt. No real payment, courier booking, ownership transfer or payout is authorized by a sandbox result.
