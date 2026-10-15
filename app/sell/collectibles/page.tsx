import { notFound } from 'next/navigation';
import { CollectibleSellForm } from '@/components/sell/collectible-sell-form';
export default function CollectiblesPage() {
  if (process.env.VERCEL_ENV !== 'preview') notFound();
  return <main className="min-h-screen bg-[#050915] px-5 py-10 text-white"><div className="mx-auto max-w-3xl"><CollectibleSellForm /></div></main>;
}
