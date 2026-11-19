import { prisma } from '@/lib/db';
import { Catalog } from '@/components/catalog';
export default async function Shop({searchParams}:{searchParams:Promise<{q?:string;category?:string}>}){
  const params=await searchParams;let products:any[]=[];let categories:any[]=[];
  try{
    [products,categories]=await Promise.all([
      prisma.product.findMany({where:{active:true,...(params.q?{OR:[{name:{contains:params.q,mode:'insensitive'}},{description:{contains:params.q,mode:'insensitive'}}]}:{})},include:{category:true},orderBy:[{featured:'desc'},{createdAt:'desc'}]}),
      prisma.category.findMany({where:{active:true},orderBy:{sortOrder:'asc'}})
    ]);
  }catch{}
  return <div className="container section"><div className="section-heading"><div><span className="eyebrow">CATALOG</span><h1>Shop all products</h1><p>Discover products across every category.</p></div></div><Catalog initialProducts={products.map(p=>({...p,price:p.price.toString(),compareAtPrice:p.compareAtPrice?.toString()??null}))} initialCategories={categories} initialQuery={params.q||''} initialCategory={params.category||''}/></div>;
}
