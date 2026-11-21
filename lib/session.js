import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { readSession, SESSION_COOKIE } from './auth';

// À appeler en tête de chaque page et de chaque action de l'admin.
export async function requireAdmin() {
  const cookieStore = await cookies();
  const session = readSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect('/admin/login');
  return session;
}
