import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

const ADMIN_EMAIL = 'kanan.gahramanov@seabreeze.az';

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Dashboard — login tələb edir (admin və ya guest)
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Admin — yalnız admin email
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    if (user.email !== ADMIN_EMAIL) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Admin write API — yalnız admin
  if (pathname === '/api/data/save' && request.method === 'POST') {
    if (!user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Yalnız admin yaza bilər' }, { status: 403 });
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/api/data/save'],
};
