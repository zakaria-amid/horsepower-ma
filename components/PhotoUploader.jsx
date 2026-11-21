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

export default function PhotoUploader({ modelId, slug, altBase }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);

  async function onFiles(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setBusy(true);
    setLog([]);
    let added = 0;

    for (const [index, file] of files.entries()) {
      const label = file.name;
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
        });
        added += 1;
        const saved = Math.max(0, Math.round((1 - (large.blob.size + thumb.blob.size) / file.size) * 100));
        push(`${kb(file.size)} → ${kb(large.blob.size)} + miniature ${kb(thumb.blob.size)} (−${saved} %)`);
      } catch (err) {
        push(err?.message || 'Échec de l’envoi', false);
      }
    }

    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
    if (added > 0) router.refresh();
  }

  return (
    <div className="uploader">
      <label className={busy ? 'dropzone busy' : 'dropzone'}>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={onFiles} disabled={busy} />
        <b>{busy ? 'Compression et envoi en cours…' : 'Ajouter des photos'}</b>
        <span>JPG, PNG ou WebP · converties en WebP 1600 px + miniature 640 px avant l'envoi</span>
      </label>
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
