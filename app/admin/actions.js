'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { del } from '@vercel/blob';
import { requireAdmin } from '../../lib/session';
import { ensureSchema, q, slugify, BODY_TYPES, FUELS, GEARBOXES, STATUSES, PRICE_SOURCES } from '../../lib/db';

function text(form, key, max = 200) {
  const v = String(form.get(key) ?? '').trim();
  return v === '' ? null : v.slice(0, max);
}
function int(form, key) {
  const raw = String(form.get(key) ?? '').replace(/[\s.]/g, '').replace(',', '');
  if (raw === '') return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
function pick(form, key, allowed, fallback = null) {
  const v = text(form, key);
  return allowed.includes(v) ? v : fallback;
}
function url(form, key) {
  const v = text(form, key, 500);
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}
function date(form, key) {
  const v = text(form, key, 10);
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}
function back(path, kind, message) {
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}${kind}=${encodeURIComponent(message)}`;
}
function explain(err, fallback) {
  if (err?.code === '23505') return 'Cet élément existe déjà (nom en double).';
  console.error(err);
  return fallback;
}

/* ---------------- Marques ---------------- */

export async function createBrand(form) {
  await requireAdmin();
  await ensureSchema();
  const name = text(form, 'name', 80);
  let target;
  if (!name) {
    target = back('/admin/marques', 'erreur', 'Le nom de la marque est obligatoire.');
  } else {
    try {
      await q('insert into brands (name, slug, country, website) values ($1, $2, $3, $4)', [
        name,
        slugify(name),
        text(form, 'country', 60),
        url(form, 'website'),
      ]);
      target = back('/admin/marques', 'ok', `Marque « ${name} » ajoutée.`);
    } catch (err) {
      target = back('/admin/marques', 'erreur', explain(err, "Impossible d'ajouter la marque."));
    }
  }
  redirect(target);
}

export async function updateBrand(form) {
  await requireAdmin();
  await ensureSchema();
  const id = int(form, 'id');
  const name = text(form, 'name', 80);
  let target;
  if (!id || !name) {
    target = back(`/admin/marques/${id || ''}`, 'erreur', 'Le nom de la marque est obligatoire.');
  } else {
    try {
      await q(
        'update brands set name = $2, slug = $3, country = $4, website = $5, active = $6, updated_at = now() where id = $1',
        [id, name, slugify(name), text(form, 'country', 60), url(form, 'website'), form.get('active') === 'on']
      );
      target = back('/admin/marques', 'ok', `Marque « ${name} » enregistrée.`);
    } catch (err) {
      target = back(`/admin/marques/${id}`, 'erreur', explain(err, "Impossible d'enregistrer la marque."));
    }
  }
  redirect(target);
}

export async function deleteBrand(form) {
  await requireAdmin();
  await ensureSchema();
  const id = int(form, 'id');
  let target = '/admin/marques';
  try {
    const rows = await q('delete from brands where id = $1 returning name', [id]);
    target = back('/admin/marques', 'ok', rows[0] ? `Marque « ${rows[0].name} » supprimée, avec ses modèles.` : 'Marque introuvable.');
  } catch (err) {
    target = back('/admin/marques', 'erreur', explain(err, 'Impossible de supprimer la marque.'));
  }
  redirect(target);
}

/* ---------------- Modèles ---------------- */

export async function createModel(form) {
  await requireAdmin();
  await ensureSchema();
  const brandId = int(form, 'brand_id');
  const name = text(form, 'name', 80);
  let target;
  if (!brandId || !name) {
    target = back('/admin/modeles', 'erreur', 'Choisissez une marque et indiquez le nom du modèle.');
  } else {
    try {
      const rows = await q(
        'insert into models (brand_id, name, slug, body_type, fuel, status) values ($1, $2, $3, $4, $5, $6) returning id',
        [brandId, name, slugify(name), pick(form, 'body_type', BODY_TYPES), pick(form, 'fuel', FUELS), pick(form, 'status', STATUSES, 'brouillon')]
      );
      target = back(`/admin/modeles/${rows[0].id}`, 'ok', `Modèle « ${name} » créé. Ajoutez maintenant ses versions et prix.`);
    } catch (err) {
      target = back('/admin/modeles', 'erreur', explain(err, "Impossible d'ajouter le modèle."));
    }
  }
  redirect(target);
}

export async function updateModel(form) {
  await requireAdmin();
  await ensureSchema();
  const id = int(form, 'id');
  const brandId = int(form, 'brand_id');
  const name = text(form, 'name', 80);
  let target;
  if (!id || !brandId || !name) {
    target = back(`/admin/modeles/${id || ''}`, 'erreur', 'La marque et le nom du modèle sont obligatoires.');
  } else {
    try {
      await q(
        'update models set brand_id = $2, name = $3, slug = $4, body_type = $5, fuel = $6, status = $7, updated_at = now() where id = $1',
        [id, brandId, name, slugify(name), pick(form, 'body_type', BODY_TYPES), pick(form, 'fuel', FUELS), pick(form, 'status', STATUSES, 'brouillon')]
      );
      target = back(`/admin/modeles/${id}`, 'ok', 'Modèle enregistré.');
    } catch (err) {
      target = back(`/admin/modeles/${id}`, 'erreur', explain(err, "Impossible d'enregistrer le modèle."));
    }
  }
  redirect(target);
}

export async function deleteModel(form) {
  await requireAdmin();
  await ensureSchema();
  const id = int(form, 'id');
  let target = '/admin/modeles';
  try {
    const rows = await q('delete from models where id = $1 returning name', [id]);
    target = back('/admin/modeles', 'ok', rows[0] ? `Modèle « ${rows[0].name} » supprimé.` : 'Modèle introuvable.');
  } catch (err) {
    target = back('/admin/modeles', 'erreur', explain(err, 'Impossible de supprimer le modèle.'));
  }
  redirect(target);
}

/* ---------------- Versions & prix ---------------- */

function versionValues(form) {
  return [
    text(form, 'name', 120),
    int(form, 'power_hp'),
    pick(form, 'gearbox', GEARBOXES),
    pick(form, 'fuel', FUELS),
    int(form, 'price_mad'),
    pick(form, 'price_source', PRICE_SOURCES, 'manuel'),
    url(form, 'price_source_url'),
    date(form, 'price_checked_at'),
    pick(form, 'status', STATUSES, 'brouillon'),
  ];
}

export async function createVersion(form) {
  await requireAdmin();
  await ensureSchema();
  const modelId = int(form, 'model_id');
  const values = versionValues(form);
  let target;
  if (!modelId || !values[0]) {
    target = back(`/admin/modeles/${modelId || ''}`, 'erreur', 'Le nom de la version est obligatoire.');
  } else {
    try {
      await q(
        `insert into versions (model_id, name, power_hp, gearbox, fuel, price_mad, price_source, price_source_url, price_checked_at, status)
         values ($1, $2, $3, $4, $5, $6, $7, $8, coalesce($9::date, current_date), $10)`,
        [modelId, ...values]
      );
      target = back(`/admin/modeles/${modelId}`, 'ok', `Version « ${values[0]} » ajoutée.`);
    } catch (err) {
      target = back(`/admin/modeles/${modelId}`, 'erreur', explain(err, "Impossible d'ajouter la version."));
    }
  }
  redirect(target);
}

export async function updateVersion(form) {
  await requireAdmin();
  await ensureSchema();
  const id = int(form, 'id');
  const modelId = int(form, 'model_id');
  const values = versionValues(form);
  let target;
  if (!id || !values[0]) {
    target = back(`/admin/versions/${id || ''}`, 'erreur', 'Le nom de la version est obligatoire.');
  } else {
    try {
      await q(
        `update versions set name = $2, power_hp = $3, gearbox = $4, fuel = $5, price_mad = $6, price_source = $7,
           price_source_url = $8, price_checked_at = coalesce($9::date, price_checked_at), status = $10, updated_at = now()
         where id = $1`,
        [id, ...values]
      );
      target = back(`/admin/modeles/${modelId}`, 'ok', `Version « ${values[0]} » enregistrée.`);
    } catch (err) {
      target = back(`/admin/versions/${id}`, 'erreur', explain(err, "Impossible d'enregistrer la version."));
    }
  }
  redirect(target);
}

export async function deleteVersion(form) {
  await requireAdmin();
  await ensureSchema();
  const id = int(form, 'id');
  const modelId = int(form, 'model_id');
  let target = `/admin/modeles/${modelId}`;
  try {
    await q('delete from versions where id = $1', [id]);
    target = back(`/admin/modeles/${modelId}`, 'ok', 'Version supprimée.');
  } catch (err) {
    target = back(`/admin/modeles/${modelId}`, 'erreur', explain(err, 'Impossible de supprimer la version.'));
  }
  redirect(target);
}

/* ---------------- Photos ---------------- */

const BLOB_URL = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/modeles\/\d+\/[A-Za-z0-9-]+\.webp$/;

function n(value) {
  const v = Number.parseInt(value, 10);
  return Number.isFinite(v) && v >= 0 ? v : null;
}

// Appelée par le composant d'envoi après la compression et l'envoi des deux tailles.
export async function addPhoto(input) {
  await requireAdmin();
  await ensureSchema();
  const modelId = n(input?.modelId);
  if (!modelId || !BLOB_URL.test(String(input?.url)) || !BLOB_URL.test(String(input?.thumbUrl))) {
    throw new Error('Photo refusée.');
  }
  const [{ next }] = await q('select coalesce(max(position) + 1, 0)::int as next from photos where model_id = $1', [modelId]);
  await q(
    `insert into photos (model_id, url, thumb_url, width, height, bytes, thumb_bytes, original_bytes, alt, position)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      modelId,
      input.url,
      input.thumbUrl,
      n(input.width),
      n(input.height),
      n(input.bytes),
      n(input.thumbBytes),
      n(input.originalBytes),
      String(input.alt || '').slice(0, 160) || null,
      next,
    ]
  );
  revalidatePath(`/admin/modeles/${modelId}`);
  return { ok: true };
}

export async function deletePhoto(form) {
  await requireAdmin();
  await ensureSchema();
  const id = int(form, 'id');
  const modelId = int(form, 'model_id');
  let target = `/admin/modeles/${modelId}`;
  try {
    const rows = await q('delete from photos where id = $1 returning url, thumb_url', [id]);
    if (rows[0]) {
      try {
        await del([rows[0].url, rows[0].thumb_url]);
      } catch (err) {
        console.error('Suppression Blob', err);
      }
    }
    target = back(`/admin/modeles/${modelId}`, 'ok', 'Photo supprimée.');
  } catch (err) {
    target = back(`/admin/modeles/${modelId}`, 'erreur', explain(err, 'Impossible de supprimer la photo.'));
  }
  redirect(target);
}

export async function setCoverPhoto(form) {
  await requireAdmin();
  await ensureSchema();
  const id = int(form, 'id');
  const modelId = int(form, 'model_id');
  let target = `/admin/modeles/${modelId}`;
  try {
    await q('update photos set position = position + 1 where model_id = $1', [modelId]);
    await q('update photos set position = 0 where id = $1 and model_id = $2', [id, modelId]);
    target = back(`/admin/modeles/${modelId}`, 'ok', 'Photo principale mise à jour.');
  } catch (err) {
    target = back(`/admin/modeles/${modelId}`, 'erreur', explain(err, 'Impossible de changer la photo principale.'));
  }
  redirect(target);
}
