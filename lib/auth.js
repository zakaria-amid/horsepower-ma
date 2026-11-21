import crypto from 'node:crypto';

// Le mot de passe n'est jamais stocké en clair : ADMIN_PASSWORD_HASH contient
// une empreinte PBKDF2 au format "pbkdf2$<iterations>$<sel base64>$<hash base64>".
// ADMIN_EMAIL, ADMIN_PASSWORD_HASH et AUTH_SECRET sont des variables d'environnement Vercel.

export const SESSION_COOKIE = 'hp_admin';
const SESSION_DAYS = 7;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET manquant');
  return s;
}

function verifyPassword(password, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = Number(parts[1]);
  const salt = Buffer.from(parts[2], 'base64');
  const expected = Buffer.from(parts[3], 'base64');
  const derived = crypto.pbkdf2Sync(password, salt, iterations, expected.length, 'sha256');
  return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
}

export function checkCredentials(email, password) {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const emailOk = adminEmail !== '' && String(email || '').trim().toLowerCase() === adminEmail;
  // On vérifie toujours le mot de passe, pour que la durée de réponse ne trahisse rien.
  const passwordOk = verifyPassword(String(password || ''), process.env.ADMIN_PASSWORD_HASH);
  return emailOk && passwordOk;
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createSession(email) {
  const payload = Buffer.from(
    JSON.stringify({ e: email, exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000 })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readSession(token) {
  if (!token || typeof token !== 'string') return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};
