import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // A Supabase auth email link (confirmation / magic link / OAuth) can land
  // anywhere on the site with a `?code=` param attached if the Supabase
  // project's Redirect URL allow-list doesn't exactly match — Supabase then
  // falls back to the bare Site URL but still keeps the code. Without this,
  // that code just sits unused in the address bar: no session ever gets
  // created, and the user gets bounced straight back to /login on their next
  // click. Forward it to the real callback route so it actually gets
  // exchanged for a session, regardless of where it landed.
  const code = searchParams.get('code');
  if (code && pathname !== '/auth/callback') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/callback';
    url.search = '';
    url.searchParams.set('code', code);
    url.searchParams.set('redirect', pathname === '/' ? '/account' : pathname);
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
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

  // Refreshes the auth token if expired — required for Server Components,
  // which cannot set cookies themselves.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /account only — checkout allows guest purchases now, so a
  // signed-out user can "Buy Now" straight through without being forced to
  // log in first (they fill in an email on the checkout form instead).
  const protectedPaths = ['/account'];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
