/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Pas d'optimisation d'image côté Vercel : les photos sont déjà compressées en WebP dans le navigateur.
  images: { unoptimized: true },
  async rewrites() {
    return {
      // La page d'accueil publique reste le fichier statique public/home.html
      beforeFiles: [{ source: '/', destination: '/home.html' }],
    };
  },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/admin',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

export default nextConfig;
