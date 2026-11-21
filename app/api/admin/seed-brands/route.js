import { NextResponse } from 'next/server';
import { ensureSchema, q, slugify } from '../../../../lib/db';

// Route temporaire d'amorçage : supprimée juste après usage.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOKEN = 'nJ7EZRMbuoPugAAaKy9l9XNtSaWBvj9s';
const BRANDS = [
  ['Dacia', 'Roumanie', 'https://www.dacia.ma'],
  ['Renault', 'France', 'https://www.renault.ma'],
  ['Peugeot', 'France', 'https://www.peugeot.ma'],
  ['Toyota', 'Japon', 'https://www.toyota.ma'],
  ['Hyundai', 'Corée du Sud', 'https://www.hyundai.ma'],
  ['Kia', 'Corée du Sud', 'https://www.kia.ma'],
  ['Volkswagen', 'Allemagne', 'https://www.volkswagen.ma'],
  ['Chery', 'Chine', 'https://www.chery.ma'],
  ['BYD', 'Chine', 'https://www.byd-maroc.com'],
  ['MG', 'Royaume-Uni', null],
];

export async function GET(request) {
  if (new URL(request.url).searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ error: 'non autorisé' }, { status: 401 });
  }
  await ensureSchema();
  const added = [];
  for (const [name, country, website] of BRANDS) {
    const rows = await q(
      'insert into brands (name, slug, country, website) values ($1, $2, $3, $4) on conflict (name) do nothing returning name',
      [name, slugify(name), country, website]
    );
    if (rows[0]) added.push(rows[0].name);
  }
  const [{ total }] = await q('select count(*)::int as total from brands');
  return NextResponse.json({ added, total });
}
