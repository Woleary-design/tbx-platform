import { notFound } from 'next/navigation';
import { CollectibleCatalogueExplorer } from '@/components/atlas/collectible-catalogue-explorer';
export default async function CollectibleAtlasPage({searchParams}:{searchParams:Promise<{category?:string}>}) {
  const {category}=await searchParams;
  if (process.env.VERCEL_ENV !== 'preview') notFound();
  return <div className="mx-auto max-w-4xl rounded-2xl bg-[#050915] p-5 sm:p-8"><CollectibleCatalogueExplorer initialCategory={category==='hot-wheels'?'Hot Wheels':'Pokémon'}/></div>;
}
