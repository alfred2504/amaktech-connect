import { NextResponse } from 'next/server';
export function requireAdmin(request: Request) {
  const expected = process.env.ADMIN_API_TOKEN;
  const provided = request.headers.get('x-admin-token');
  if (!expected || !provided || provided !== expected) return NextResponse.json({error:'Unauthorized admin access'}, {status:401});
  return null;
}
