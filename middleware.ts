import type { Database } from '@/types_db';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'fr'];

export async function middleware(req: NextRequest) {
  const intlMiddleware = createMiddleware({
    locales,
    defaultLocale: 'en'
  });
  const res = intlMiddleware(req);
  // const supabase = createMiddlewareClient<Database>({ req, res })
  // await supabase.auth.getSession()
  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next|_next/static|_next/image|images|sounds|icons|crepe|manifest.json|sw.js).*)'
  ]
};
