import { lookup } from 'node:dns/promises';
import net from 'node:net';
import { readSession, SESSION_COOKIE } from '../../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 20 * 1024 * 1024;
const MAX_REDIRECTS = 3;

// Refuse les adresses internes (protection contre les requêtes vers le réseau privé)
function isPrivate(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v = ip.toLowerCase();
  return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80') || v.startsWith('::ffff:');
}

async function assertPublicUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('Lien invalide.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Le lien doit commencer par https://');
  const addresses = await lookup(url.hostname, { all: true });
  if (addresses.length === 0 || addresses.some((a) => isPrivate(a.address))) throw new Error('Adresse refusée.');
  return url;
}

function fail(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), { status, headers: { 'content-type': 'application/json' } });
}

// Récupère une image depuis un lien (espace presse d'une marque) pour que le navigateur de l'admin
// puisse la compresser. Aucune transformation ici : on relaie simplement le fichier.
export async function GET(request) {
  if (!readSession(request.cookies.get(SESSION_COOKIE)?.value)) return fail('Non autorisé', 401);
  const raw = new URL(request.url).searchParams.get('url') || '';

  try {
    let url = await assertPublicUrl(raw);
    let response;
    for (let i = 0; i <= MAX_REDIRECTS; i += 1) {
      response = await fetch(url, {
        redirect: 'manual',
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; HorsepowerBot/1.0; +https://horsepower.ma)', accept: 'image/*' },
        signal: AbortSignal.timeout(15000),
      });
      if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
        url = await assertPublicUrl(new URL(response.headers.get('location'), url).toString());
        continue;
      }
      break;
    }
    if (!response.ok) return fail(`Le site a répondu ${response.status}.`);
    const type = (response.headers.get('content-type') || '').split(';')[0].trim();
    if (!type.startsWith('image/')) return fail("Ce lien ne pointe pas vers une image. Ouvrez la photo seule dans un onglet et copiez son adresse.");
    const declared = Number(response.headers.get('content-length') || 0);
    if (declared > MAX_BYTES) return fail('Image trop lourde (20 Mo maximum).');

    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        return fail('Image trop lourde (20 Mo maximum).');
      }
      chunks.push(value);
    }
    return new Response(Buffer.concat(chunks), {
      status: 200,
      headers: { 'content-type': type, 'cache-control': 'no-store', 'x-source-url': encodeURI(url.toString()) },
    });
  } catch (err) {
    return fail(err?.name === 'TimeoutError' ? 'Le site met trop de temps à répondre.' : err?.message || 'Import impossible.');
  }
}
