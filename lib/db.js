import { neon } from '@neondatabase/serverless';

let client;
export function db() {
  if (!client) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL manquant');
    client = neon(process.env.DATABASE_URL);
  }
  return client;
}

// Requête paramétrée : q('select * from brands where id = $1', [id])
export async function q(text, params = []) {
  return db().query(text, params);
}

// Création des tables (idempotente). Exécutée une fois par instance serveur.
const SCHEMA = [
  `create table if not exists brands (
    id serial primary key,
    name text not null unique,
    slug text not null unique,
    country text,
    website text,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `create table if not exists models (
    id serial primary key,
    brand_id integer not null references brands(id) on delete cascade,
    name text not null,
    slug text not null,
    body_type text,
    fuel text,
    status text not null default 'brouillon',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (brand_id, slug)
  )`,
  `create table if not exists versions (
    id serial primary key,
    model_id integer not null references models(id) on delete cascade,
    name text not null,
    power_hp integer,
    gearbox text,
    fuel text,
    price_mad integer,
    price_source text not null default 'manuel',
    price_source_url text,
    price_checked_at date,
    status text not null default 'brouillon',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `create table if not exists leads (
    id serial primary key,
    first_name text,
    phone text,
    model_wanted text,
    city text,
    source text not null default 'site',
    status text not null default 'nouveau',
    created_at timestamptz not null default now()
  )`,
  `create table if not exists photos (
    id serial primary key,
    model_id integer not null references models(id) on delete cascade,
    url text not null,
    thumb_url text not null,
    width integer,
    height integer,
    bytes integer,
    thumb_bytes integer,
    original_bytes integer,
    alt text,
    position integer not null default 0,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists photos_model_idx on photos(model_id, position)`,
  `create index if not exists models_brand_idx on models(brand_id)`,
  `create index if not exists versions_model_idx on versions(model_id)`,
];

let schemaReady;
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      for (const statement of SCHEMA) await q(statement);
    })().catch((err) => {
      schemaReady = undefined;
      throw err;
    });
  }
  return schemaReady;
}

export function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' et ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export const BODY_TYPES = ['Citadine', 'Compacte', 'Berline', 'SUV', 'Crossover', 'Break', 'Monospace', 'Coupé', 'Cabriolet', 'Pick-up', 'Utilitaire'];
export const FUELS = ['Essence', 'Diesel', 'Hybride', 'Hybride rechargeable', 'Électrique', 'GPL'];
export const GEARBOXES = ['Manuelle', 'Automatique'];
export const STATUSES = ['brouillon', 'publié'];
export const PRICE_SOURCES = ['manuel', 'site importateur', 'partenaire', 'import automatique'];
