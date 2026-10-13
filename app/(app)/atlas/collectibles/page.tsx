import { notFound } from 'next/navigation';
import { CollectibleCatalogueExplorer } from '@/components/atlas/collectible-catalogue-explorer';
export default function CollectibleAtlasPage() {
  if (process.env.VERCEL_ENV !== 'preview') notFound();
  return <div className="mx-auto max-w-4xl rounded-2xl bg-[#050915] p-5 sm:p-8"><CollectibleCatalogueExplorer/></div>;
}
