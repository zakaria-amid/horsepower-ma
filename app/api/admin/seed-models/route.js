import { NextResponse } from 'next/server';
import { ensureSchema, q, slugify } from '../../../../lib/db';

// Route temporaire d'amorçage : supprimée juste après usage.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOKEN = 'OHTzZQWMIgPlI7n8edyvdW8QFSDeDL0b';
// [marque, modèle, carrosserie, énergie]
const MODELS = [
  ['Dacia', 'Sandero', 'Citadine', 'Essence'],
  ['Dacia', 'Sandero Stepway', 'Crossover', 'Essence'],
  ['Dacia', 'Logan', 'Berline', 'Essence'],
  ['Dacia', 'Duster', 'SUV', 'Diesel'],
  ['Dacia', 'Jogger', 'Monospace', 'Essence'],
  ['Renault', 'Clio', 'Citadine', 'Essence'],
  ['Renault', 'Kardian', 'Crossover', 'Essence'],
  ['Renault', 'Captur', 'SUV', 'Essence'],
  ['Renault', 'Austral', 'SUV', 'Hybride'],
  ['Peugeot', '208', 'Citadine', 'Essence'],
  ['Peugeot', '2008', 'SUV', 'Essence'],
  ['Peugeot', '3008', 'SUV', 'Hybride'],
  ['Peugeot', '5008', 'SUV', 'Hybride'],
  ['Toyota', 'Yaris', 'Citadine', 'Hybride'],
  ['Toyota', 'Yaris Cross', 'SUV', 'Hybride'],
  ['Toyota', 'Corolla', 'Berline', 'Hybride'],
  ['Toyota', 'RAV4', 'SUV', 'Hybride'],
  ['Toyota', 'Hilux', 'Pick-up', 'Diesel'],
  ['Hyundai', 'i10', 'Citadine', 'Essence'],
  ['Hyundai', 'Accent', 'Berline', 'Essence'],
  ['Hyundai', 'Creta', 'SUV', 'Essence'],
  ['Hyundai', 'Tucson', 'SUV', 'Hybride'],
  ['Kia', 'Picanto', 'Citadine', 'Essence'],
  ['Kia', 'Sportage', 'SUV', 'Hybride'],
  ['Kia', 'Sorento', 'SUV', 'Hybride'],
  ['Volkswagen', 'Polo', 'Citadine', 'Essence'],
  ['Volkswagen', 'Golf', 'Compacte', 'Essence'],
  ['Volkswagen', 'T-Roc', 'SUV', 'Essence'],
  ['Volkswagen', 'Tiguan', 'SUV', 'Diesel'],
  ['Chery', 'Tiggo 4 Cross', 'SUV', 'Hybride'],
  ['Chery', 'Tiggo 7 Pro', 'SUV', 'Hybride rechargeable'],
  ['Chery', 'Tiggo 8 Pro', 'SUV', 'Hybride rechargeable'],
  ['BYD', 'Seagull', 'Citadine', 'Électrique'],
  ['BYD', 'Atto 3', 'SUV', 'Électrique'],
  ['BYD', 'Seal U DM-i', 'SUV', 'Hybride rechargeable'],
  ['BYD', 'Sealion 5', 'SUV', 'Hybride rechargeable'],
  ['BYD', 'Seal', 'Berline', 'Électrique'],
  ['MG', 'MG3', 'Citadine', 'Hybride'],
  ['MG', 'ZS', 'SUV', 'Hybride'],
  ['MG', 'MG4', 'Compacte', 'Électrique'],
  ['MG', 'HS', 'SUV', 'Essence'],
];
// Prix publiés dans la presse au lancement : gardés en brouillon, à confirmer.
// [marque, modèle, version, énergie, prix, lien, date]
const VERSIONS = [
  ['BYD', 'Seagull', 'Version unique (lancement)', 'Électrique', 209900, 'https://snrtnews.com/fr/article/automobile-lancement-de-la-byd-seagull-au-maroc-116523', '2025-03-14'],
  ['BYD', 'Sealion 5', 'Super Hybride (prix de départ)', 'Hybride rechargeable', 299900, 'https://lematin.ma/automobile/atto-3-evo-et-sealion-5-byd-maroc-elargit-son-terrain-de-jeu/351602', '2026-06-20'],
];

export async function GET(request) {
  if (new URL(request.url).searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ error: 'non autorisé' }, { status: 401 });
  }
  await ensureSchema();
  let models = 0;
  let versions = 0;
  for (const [brand, name, body, fuel] of MODELS) {
    const rows = await q(
      `insert into models (brand_id, name, slug, body_type, fuel, status)
       select id, $2, $3, $4, $5, 'publié' from brands where name = $1
       on conflict (brand_id, slug) do nothing returning id`,
      [brand, name, slugify(name), body, fuel]
    );
    if (rows[0]) models += 1;
  }
  for (const [brand, model, name, fuel, price, link, date] of VERSIONS) {
    const rows = await q(
      `insert into versions (model_id, name, fuel, price_mad, price_source, price_source_url, price_checked_at, status)
       select m.id, $3, $4, $5, 'manuel', $6, $7::date, 'brouillon'
         from models m join brands b on b.id = m.brand_id
        where b.name = $1 and m.name = $2
          and not exists (select 1 from versions v where v.model_id = m.id and v.name = $3)
       returning id`,
      [brand, model, name, fuel, price, link, date]
    );
    if (rows[0]) versions += 1;
  }
  const [t] = await q('select (select count(*) from models)::int as models, (select count(*) from versions)::int as versions');
  return NextResponse.json({ added: { models, versions }, total: t });
}
