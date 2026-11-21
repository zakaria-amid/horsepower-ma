'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { addPhoto } from '../app/admin/actions';

// Réglages de compression (faits dans le navigateur, zéro calcul côté Vercel)
const LARGE = { maxSide: 1600, quality: 0.8 }; // fiche modèle, plein écran
const THUMB = { maxSide: 640, quality: 0.75 }; // cartes, listes
const MAX_INPUT = 25 * 1024 * 1024;

function kb(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} Mo` : `${Math.round(bytes / 1024)} Ko`;
}

async function decode(file) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* on tente la méthode classique */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function resizeToWebp(source, { maxSide, quality }) {
  const w = source.width;
  const h = source.height;
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const width = Math.round(w * scale);
  const height = Math.round(h * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.type !== 'image/webp') reject(new Error("Ce navigateur ne sait pas créer de WebP. Utilisez Chrome, Edge, Firefox ou Safari récent."));
        else resolve({ blob, width, height });
      },
      'image/webp',
      quality
    );
  });
}

export default function PhotoUploader({ modelId, slug, altBase, brandName }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const [links, setLinks] = useState('');
  const [credit, setCredit] = useState(brandName ? `© ${brandName}` : '');

  async function processOne(file, index, label, meta = {}) {
    const push = (text, ok = true) => setLog((l) => [...l, { label, text, ok }]);
    try {
      if (!file.type.startsWith('image/')) throw new Error("Ce fichier n'est pas une image.");
      if (file.size > MAX_INPUT) throw new Error('Image trop lourde (25 Mo maximum).');

      const source = await decode(file);
      const large = await resizeToWebp(source, LARGE);
      const thumb = await resizeToWebp(source, THUMB);
      if (source.close) source.close();

      const base = `modeles/${modelId}/${slug || 'photo'}-${Date.now()}-${index}`;
      const opts = { access: 'public', handleUploadUrl: '/api/admin/upload', contentType: 'image/webp' };
      const [bigBlob, smallBlob] = await Promise.all([
        upload(`${base}-l.webp`, large.blob, opts),
        upload(`${base}-s.webp`, thumb.blob, opts),
      ]);

      await addPhoto({
        modelId,
        url: bigBlob.url,
        thumbUrl: smallBlob.url,
        width: large.width,
        height: large.height,
        bytes: large.blob.size,
        thumbBytes: thumb.blob.size,
        originalBytes: file.size,
        alt: altBase,
        credit: meta.credit,
        sourceUrl: meta.sourceUrl,
      });
      const saved = Math.max(0, Math.round((1 - (large.blob.size + thumb.blob.size) / file.size) * 100));
      push(`${kb(file.size)} → ${kb(large.blob.size)} + miniature ${kb(thumb.blob.size)} (−${saved} %)`);
      return true;
    } catch (err) {
      push(err?.message || 'Échec de l’envoi', false);
      return false;
    }
  }

  async function onFiles(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setBusy(true);
    setLog([]);
    let added = 0;
    for (const [index, file] of files.entries()) {
      if (await processOne(file, index, file.name, { credit: credit.trim() || null })) added += 1;
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
    if (added > 0) router.refresh();
  }

  async function onImportLinks(event) {
    event.preventDefault();
    const urls = links
      .split(/\s+/)
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\//i.test(u));
    if (urls.length === 0) {
      setLog([{ label: 'Liens', text: 'Collez au moins un lien commençant par https://', ok: false }]);
      return;
    }
    setBusy(true);
    setLog([]);
    let added = 0;
    for (const [index, link] of urls.entries()) {
      const label = link.length > 60 ? `${link.slice(0, 57)}…` : link;
      try {
        const res = await fetch(`/api/admin/fetch-image?url=${encodeURIComponent(link)}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Erreur ${res.status}`);
        }
        const blob = await res.blob();
        const file = new File([blob], 'import', { type: blob.type });
        if (await processOne(file, index, label, { credit: credit.trim() || null, sourceUrl: link })) added += 1;
      } catch (err) {
        setLog((l) => [...l, { label, text: err?.message || 'Import impossible', ok: false }]);
      }
    }
    setBusy(false);
    if (added > 0) {
      setLinks('');
      router.refresh();
    }
  }

  return (
    <div className="uploader">
      <label className="field">
        Crédit photo (affiché sur le site)
        <input value={credit} onChange={(e) => setCredit(e.target.value)} maxLength={120} placeholder="© Marque, ou votre nom" />
      </label>

      <label className={busy ? 'dropzone busy' : 'dropzone'}>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={onFiles} disabled={busy} />
        <b>{busy ? 'Compression et envoi en cours…' : 'Ajouter des photos depuis l’ordinateur'}</b>
        <span>JPG, PNG ou WebP · converties en WebP 1600 px + miniature 640 px avant l'envoi</span>
      </label>

      <form className="import-links" onSubmit={onImportLinks}>
        <label className="field">
          Ou importer depuis l’espace presse (un lien d’image par ligne)
          <textarea
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            rows={3}
            placeholder="https://media.marque.com/…/photo.jpg"
            disabled={busy}
          />
        </label>
        <button type="submit" className="btn-ghost" disabled={busy}>
          Importer les liens
        </button>
      </form>

      {log.length > 0 && (
        <ul className="upload-log" aria-live="polite">
          {log.map((item, i) => (
            <li key={i} className={item.ok ? 'ok' : 'ko'}>
              <span className="name">{item.label}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
