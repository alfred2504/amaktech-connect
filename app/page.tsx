import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { Catalog } from '@/components/catalog';
type CatalogProduct = Prisma.ProductGetPayload<{ include: { category: true; images: true } }>;
export default async function Shop({searchParams}:{searchParams:Promise<{q?:string;category?:string}>}){
  const params=await searchParams;let products:CatalogProduct[]=[];let categories:Awaited<ReturnType<typeof prisma.category.findMany>>=[];
  try{
    [products,categories]=await Promise.all([
      prisma.product.findMany({where:{status:'ACTIVE',...(params.q?{OR:[{name:{contains:params.q,mode:'insensitive'}},{description:{contains:params.q,mode:'insensitive'}}]}:{})},include:{category:true,images:{orderBy:{sortOrder:'asc'}}},orderBy:[{isFeatured:'desc'},{createdAt:'desc'}]}),
      prisma.category.findMany({where:{isActive:true},orderBy:{sortOrder:'asc'}})
    ]);
  }catch{}
  const catalogProducts = products.map(product => ({ ...product, price: product.price.toString(), comparePrice: product.comparePrice?.toString() ?? null }));
  return <div className="container section"><div className="section-heading"><div><span className="eyebrow">CATALOG</span><h1>Shop all products</h1><p>Discover products across every category.</p></div></div><Catalog initialProducts={catalogProducts} initialCategories={categories} initialQuery={params.q||''} initialCategory={params.category||''}/></div>;
}
