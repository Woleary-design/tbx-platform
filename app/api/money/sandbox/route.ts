import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sandboxConfig } from '@/lib/payments/payfast';

export async function POST(request: Request) {
 const config = sandboxConfig();
 if (!config || process.env.VERCEL_ENV !== 'preview') return NextResponse.json({ error: 'Test ledger is unavailable.' }, { status: 503 });
 if (request.headers.get('origin') !== config.siteUrl) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
 const body = await request.json().catch(() => null);
 if (!body || typeof body.ledgerId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.ledgerId)
  || !['courier_cost','processor_cost','dispatch','deliver','accept','dispute','payout','refund'].includes(body.action)
  || (body.costCents != null && (!Number.isSafeInteger(body.costCents) || body.costCents < 0 || body.costCents > 100000000))
  || (body.note != null && (typeof body.note !== 'string' || body.note.length > 1000))) {
  return NextResponse.json({ error: 'Check the test action and amount.' }, { status: 400 });
 }
 const supabase = await createClient();
 const { data } = await supabase.auth.getUser();
 if (!data.user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
 const { error } = await supabase.rpc('act_on_sandbox_ledger', {
  target_ledger_id: body.ledgerId, requested_action: body.action,
  cost_cents: body.costCents ?? null, note: body.note ?? null,
 });
 if (error) return NextResponse.json({ error: 'This action is not available. Check the order stage, costs and your account permissions.' }, { status: 409 });
 return NextResponse.json({ ok: true, simulation: true });
}
