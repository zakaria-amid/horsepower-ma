import { ensureSchema, q } from './db';

// Requêtes du site public : seuls les éléments publiés et les marques actives sont visibles.

export async function getBrands() {
  await ensureSchema();
  return q(`
    select b.id, b.name, b.slug, b.country,
           count(m.id) filter (where m.status = 'publié')::int as model_count,
           (select p.thumb_url from photos p join models mm on mm.id = p.model_id
             where mm.brand_id = b.id and mm.status = 'publié' order by p.position, p.id limit 1) as thumb_url
      from brands b
      left join models m on m.brand_id = b.id
     where b.active
     group by b.id
     order by b.name`);
}

export async function getBrand(slug) {
  await ensureSchema();
  const rows = await q('select * from brands where slug = $1 and active', [slug]);
  return rows[0] || null;
}

export async function getModels({ brand = null, body = null, fuel = null, maxPrice = null } = {}) {
  await ensureSchema();
  return q(
    `select * from (
       select m.id, m.name, m.slug, m.body_type, m.fuel,
              b.name as brand_name, b.slug as brand_slug,
              (select min(v.price_mad) from versions v where v.model_id = m.id and v.status = 'publié') as min_price,
              (select min(round(v.price_mad::numeric / nullif(v.power_hp, 0))) from versions v
                where v.model_id = m.id and v.status = 'publié' and v.price_mad is not null) as best_dh_hp,
              (select p.thumb_url from photos p where p.model_id = m.id order by p.position, p.id limit 1) as thumb_url,
              (select p.credit from photos p where p.model_id = m.id order by p.position, p.id limit 1) as credit
         from models m
         join brands b on b.id = m.brand_id
        where m.status = 'publié' and b.active
          and ($1::text is null or b.slug = $1)
          and ($2::text is null or m.body_type = $2)
          and ($3::text is null or m.fuel = $3)
     ) t
     where ($4::int is null or (min_price is not null and min_price <= $4))
     order by brand_name, name`,
    [brand, body, fuel, maxPrice]
  );
}

export async function getModel(brandSlug, modelSlug) {
  await ensureSchema();
  const rows = await q(
    `select m.*, b.name as brand_name, b.slug as brand_slug, b.website as brand_website
       from models m join brands b on b.id = m.brand_id
      where b.slug = $1 and m.slug = $2 and m.status = 'publié' and b.active`,
    [brandSlug, modelSlug]
  );
  const model = rows[0];
  if (!model) return null;
  const [versions, photos] = await Promise.all([
    q(`select * from versions where model_id = $1 and status = 'publié' order by price_mad nulls last, name`, [model.id]),
    q('select * from photos where model_id = $1 order by position, id', [model.id]),
  ]);
  return { ...model, versions, photos };
}

export async function getRanking(limit = 100) {
  await ensureSchema();
  return q(
    `select v.id, v.name as version_name, v.power_hp, v.price_mad,
            round(v.price_mad::numeric / v.power_hp)::int as dh_per_hp,
            m.name as model_name, m.slug as model_slug, b.name as brand_name, b.slug as brand_slug
       from versions v
       join models m on m.id = v.model_id
       join brands b on b.id = m.brand_id
      where v.status = 'publié' and m.status = 'publié' and b.active
        and v.price_mad is not null and v.power_hp > 0
      order by dh_per_hp asc, v.price_mad asc
      limit $1`,
    [limit]
  );
}

export function money(value) {
  if (value === null || value === undefined) return null;
  return `${Number(value).toLocaleString('fr-FR').replace(/ | /g, ' ')} DH`;
}

export const BUDGETS = [
  { value: 150000, label: 'Moins de 150 000 DH' },
  { value: 200000, label: 'Moins de 200 000 DH' },
  { value: 300000, label: 'Moins de 300 000 DH' },
  { value: 500000, label: 'Moins de 500 000 DH' },
];
