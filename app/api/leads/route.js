import { NextResponse } from 'next/server';
import { ensureSchema, q } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function field(form, key, max) {
  return String(form.get(key) ?? '').trim().slice(0, max) || null;
}

// Enregistre une demande d'offre envoyée depuis le site (accueil, fiche modèle, contact).
export async function POST(request) {
  const form = await request.formData();
  // Champ piège : rempli uniquement par les robots
  if (field(form, 'site_web', 200)) return NextResponse.redirect(new URL('/merci', request.url), 303);

  const firstName = field(form, 'prenom', 60);
  const phone = field(form, 'telephone', 30);
  if (!phone || phone.replace(/\D/g, '').length < 8) {
    return NextResponse.redirect(new URL('/contact?erreur=telephone', request.url), 303);
  }
  try {
    await ensureSchema();
    await q('insert into leads (first_name, phone, model_wanted, city, source) values ($1, $2, $3, $4, $5)', [
      firstName,
      phone,
      field(form, 'modele', 120),
      field(form, 'ville', 60),
      field(form, 'source', 120) || 'site',
    ]);
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(new URL('/contact?erreur=serveur', request.url), 303);
  }
  return NextResponse.redirect(new URL('/merci', request.url), 303);
}
