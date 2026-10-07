# PayFast preview callback setup

The sandbox remains disabled until the callback is reachable.

1. In Vercel project Settings → Deployment Protection → Protection Bypass for Automation, create a dedicated secret for TBX sandbox testing.
2. Save it as the Secret variable `TBX_PAYFAST_NOTIFY_BYPASS` for Preview on `fix/auth-launch-checks` and redeploy. Do not paste it into chat or commit it.
3. Verify an invalid POST to the notify URL reaches the application and is rejected by signature validation rather than Vercel Authentication.
4. Enable `TBX_PAYFAST_SANDBOX_ENABLED` only on this preview branch and redeploy. Leave `TBX_PAYMENTS_LIVE=false`.
5. Complete a fresh seller-confirmed reservation and PayFast sandbox transaction before its deadline.

The bypass is included only in the signed notification URL when VERCEL_ENV=preview. Return and cancel URLs do not include it. App authorization and PayFast signature/server verification remain required. Revoke the dedicated bypass after testing.

The Vercel connector returned HTTP 403 when creating the bypass on 5 October 2026: projectProtectionBypass permission denied. A project administrator must complete the dashboard step.

Reference: https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
