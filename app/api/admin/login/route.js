import { NextResponse } from 'next/server';
import { checkCredentials, createSession, SESSION_COOKIE, sessionCookieOptions } from '../../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const form = await request.formData();
  const email = form.get('email');
  const password = form.get('password');

  if (!checkCredentials(email, password)) {
    // Petit délai pour freiner les tentatives en série
    await new Promise((resolve) => setTimeout(resolve, 900));
    return NextResponse.redirect(new URL('/admin/login?erreur=1', request.url), 303);
  }

  const response = NextResponse.redirect(new URL('/admin', request.url), 303);
  response.cookies.set(SESSION_COOKIE, createSession(String(email).trim().toLowerCase()), sessionCookieOptions);
  return response;
}
