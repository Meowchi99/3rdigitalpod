import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// ─── Routes ที่ต้องล็อกอินก่อนเข้า (ผู้ใช้ทั่วไปก็เข้าได้) ───
const USER_PROTECTED_PATHS = ['/settings', '/owner'];

// ─── Routes ที่ต้องเป็น admin หรือ owner เท่านั้น ───
const ADMIN_PROTECTED_PATHS = ['/admin'];

export async function middleware(request: NextRequest) {
  const { user, supabase, supabaseResponse } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  const needsAuth = USER_PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const needsAdmin = ADMIN_PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  // ─── Routes ที่ต้องล็อกอิน ───
  if ((needsAuth || needsAdmin) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // ─── Routes ที่ต้องเป็น admin/owner ───
  if (needsAdmin && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const role = profile?.role;
    if (role !== 'owner' && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('unauthorized', '1');
      return NextResponse.redirect(url);
    }
  }

  // ─── ถ้าล็อกอินอยู่แล้ว เข้าหน้า /login หรือ /signup → redirect กลับบ้าน ───
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
