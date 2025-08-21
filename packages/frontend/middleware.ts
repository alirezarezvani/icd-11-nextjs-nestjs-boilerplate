import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of subdomains that should not be treated as organization slugs
const RESERVED_SUBDOMAINS = ['www', 'api', 'admin', 'app', 'mail', 'support', 'help', 'docs'];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Skip middleware for localhost development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return NextResponse.next();
  }

  // Extract subdomain from hostname
  const url = new URL(request.url);
  const hostParts = hostname.split('.');
  
  // Check if we're on a subdomain (not the main domain)
  if (hostParts.length > 2) {
    const subdomain = hostParts[0];
    
    // Skip reserved subdomains
    if (!RESERVED_SUBDOMAINS.includes(subdomain)) {
      // This is an organization subdomain
      const response = NextResponse.rewrite(
        new URL(`/org/${subdomain}${pathname}`, request.url)
      );
      
      // Add headers to identify the organization
      response.headers.set('x-organization-slug', subdomain);
      response.headers.set('x-organization-domain', hostname);
      
      return response;
    }
  }
  
  // Check for custom domain (when hostname doesn't include our main domain)
  const mainDomain = process.env.MAIN_DOMAIN || 'localhost:3000';
  if (!hostname.includes(mainDomain.split(':')[0]) && !hostname.includes('localhost')) {
    // This is a custom domain
    const response = NextResponse.rewrite(
      new URL(`/domain/${hostname}${pathname}`, request.url)
    );
    
    // Add headers to identify the custom domain
    response.headers.set('x-organization-domain', hostname);
    response.headers.set('x-is-custom-domain', 'true');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};