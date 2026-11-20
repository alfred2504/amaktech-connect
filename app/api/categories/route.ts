import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export async function GET(){
  try { const categories=await prisma.category.findMany({where:{isActive:true},orderBy:[{sortOrder:'asc'},{name:'asc'}]}); return NextResponse.json(categories); }
  catch { return NextResponse.json({error:'Catalog database unavailable. Configure DATABASE_URL and run migrations.'},{status:503}); }
}
