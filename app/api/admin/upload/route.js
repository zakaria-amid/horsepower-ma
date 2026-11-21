import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { readSession, SESSION_COOKIE } from '../../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Délivre au navigateur un jeton d'envoi direct vers Vercel Blob.
// Les photos ne transitent pas par le serveur : il ne fait que vérifier que l'admin est connecté.
export async function POST(request) {
  const body = await request.json();
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = readSession(request.cookies.get(SESSION_COOKIE)?.value);
        if (!session) throw new Error('Non autorisé');
        if (!/^modeles\/\d+\/[a-z0-9-]+\.webp$/.test(pathname)) throw new Error('Nom de fichier refusé');
        return {
          allowedContentTypes: ['image/webp'],
          maximumSizeInBytes: 3 * 1024 * 1024,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 365,
        };
      },
      onUploadCompleted: async () => {
        // L'enregistrement en base est fait par l'action serveur addPhoto, après l'envoi des deux tailles.
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Envoi refusé' }, { status: 400 });
  }
}
