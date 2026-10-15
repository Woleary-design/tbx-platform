import { redirect } from "next/navigation";
import { NotificationFeed } from "@/components/notifications/notification-feed";
import { createClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=%2Fnotifications");
  return <div className="mx-auto max-w-4xl space-y-6"><h1 className="text-3xl font-semibold text-white">What needs your attention</h1><NotificationFeed /></div>;
}
