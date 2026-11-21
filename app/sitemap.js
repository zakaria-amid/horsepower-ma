import { ensureSchema, q } from '../lib/db';

export const revalidate = 3600;

const BASE = 'https://horsepower.ma';
const STATIC = ['/', '/neuf', '/marques', '/prix-par-cheval', '/essais', '/comparatifs', '/promos', '/actualites', '/contact'];

export default async function sitemap() {
  const now = new Date();
  const entries = STATIC.map((path) => ({ url: `${BASE}${path}`, lastModified: now }));
  try {
    await ensureSchema();
    const brands = await q('select slug, updated_at from brands where active');
    const models = await q(
      `select m.slug, b.slug as brand_slug, m.updated_at from models m join brands b on b.id = m.brand_id where m.status = 'publié' and b.active`
    );
    for (const b of brands) entries.push({ url: `${BASE}/marques/${b.slug}`, lastModified: b.updated_at });
    for (const m of models) entries.push({ url: `${BASE}/neuf/${m.brand_slug}/${m.slug}`, lastModified: m.updated_at });
  } catch (err) {
    console.error(err);
  }
  return entries;
}
