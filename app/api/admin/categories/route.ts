import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
export async function POST(request:Request){ const auth=requireAdmin(request); if(auth)return auth; try { const data=await request.json(); if(!data.name?.trim()||!data.slug?.trim())return NextResponse.json({error:'Name and slug are required'},{status:400}); const category=await prisma.category.create({data:{name:data.name.trim(),slug:data.slug.trim().toLowerCase(),description:data.description||null,imageUrl:data.imageUrl||null,sortOrder:Number(data.sortOrder||0)}}); return NextResponse.json(category,{status:201}); }catch{return NextResponse.json({error:'Could not create category. Slug may already exist.'},{status:400});} }
