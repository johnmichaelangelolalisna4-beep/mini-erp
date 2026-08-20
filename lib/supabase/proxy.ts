import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Apply Enterprise HTTP Security Headers
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
}

/**
 * Helper to create a redirect response while preserving refreshed auth cookies
 */
function createSecureRedirect(url: URL, originalResponse: NextResponse): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  
  // Copy all cookies set during the session refresh cycle
  originalResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value);
  });

  return applySecurityHeaders(redirectResponse);
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Refresh active auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLoginPage = path === '/';
  const isProtectedRoute =
    path.startsWith('/admin') ||
    path.startsWith('/sales') ||
    path.startsWith('/inventory') ||
    path.startsWith('/dashboard');

  // 2. Authentication Guard: Reject unauthenticated access to protected portals
  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/';
    return createSecureRedirect(loginUrl, supabaseResponse);
  }

  // 3. Authenticated Access & Role-Based Access Control (RBAC)
  if (user) {
    // Resolve user role from user metadata or public.profiles
    let role = user.user_metadata?.role;

    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      role = profile?.role || 'Sales';
    }

    const defaultPortalPath =
      role === 'Admin'
        ? '/admin/dashboard'
        : role === 'Inventory'
        ? '/inventory/overview'
        : '/sales/overview';

    // A. Logged-in Reverse Redirect: Prevent logged-in users from seeing the login screen
    if (isLoginPage) {
      const portalUrl = request.nextUrl.clone();
      portalUrl.pathname = defaultPortalPath;
      return createSecureRedirect(portalUrl, supabaseResponse);
    }

    // B. Role-Based Firewall Boundaries:
    // Sales users are restricted to /sales/* routes
    if (role === 'Sales' && (path.startsWith('/admin') || path.startsWith('/inventory'))) {
      const salesUrl = request.nextUrl.clone();
      salesUrl.pathname = '/sales/overview';
      return createSecureRedirect(salesUrl, supabaseResponse);
    }

    // Inventory users are restricted to /inventory/* routes
    if (role === 'Inventory' && (path.startsWith('/admin') || path.startsWith('/sales'))) {
      const inventoryUrl = request.nextUrl.clone();
      inventoryUrl.pathname = '/inventory/overview';
      return createSecureRedirect(inventoryUrl, supabaseResponse);
    }
  }

  // 4. Return response with security headers attached
  return applySecurityHeaders(supabaseResponse);
}
