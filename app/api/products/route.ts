import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export async function GET(request:Request){
  const url=new URL(request.url); const search=url.searchParams.get('q')?.trim(); const category=url.searchParams.get('category');
  try { const products=await prisma.product.findMany({where:{active:true,...(search?{OR:[{name:{contains:search,mode:'insensitive'}},{description:{contains:search,mode:'insensitive'}},{brand:{contains:search,mode:'insensitive'}}]}:{}),...(category?{category:{slug:category}}:{})},include:{category:true},orderBy:[{featured:'desc'},{createdAt:'desc'}]}); return NextResponse.json(products); }
  catch { return NextResponse.json({error:'Catalog database unavailable. Configure DATABASE_URL and run migrations.'},{status:503}); }
}
