import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json().catch(() => null) as { legoSetId?: string } | null;
  if (!body?.legoSetId) return NextResponse.json({ error: "legoSetId is required" }, { status: 400 });

  const { data: existing, error: lookupError } = await supabase
    .from("collector_wants")
    .select("id")
    .eq("collector_id", user.id)
    .eq("lego_set_id", body.legoSetId)
    .maybeSingle();

  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 });

  if (existing) {
    const { error } = await supabase.from("collector_wants").delete().eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("activity_events").insert({
      actor_id: user.id,
      event_type: "want.removed",
      subject_type: "lego_set",
      subject_id: body.legoSetId,
    });

    return NextResponse.json({ wanted: false });
  }

  const { error } = await supabase.from("collector_wants").insert({
    collector_id: user.id,
    lego_set_id: body.legoSetId,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("activity_events").insert({
    actor_id: user.id,
    event_type: "want.added",
    subject_type: "lego_set",
    subject_id: body.legoSetId,
  });

  return NextResponse.json({ wanted: true });
}
