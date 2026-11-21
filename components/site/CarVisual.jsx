// Silhouette affichée quand un modèle n'a pas encore de photo.
const SHAPES = {
  low: 'M10 62h14m34 0h70m34 0h18v-12c0-4-3-7-7-8l-24-6-22-17c-3-2-6-3-10-3H76c-4 0-7 1-10 4L50 36l-30 6c-6 1-10 6-10 12v8',
  tall: 'M10 62h14m34 0h70m34 0h18V44c0-4-2-7-6-8l-20-5-16-15c-3-3-7-4-11-4H70c-4 0-8 2-10 5L48 32l-28 5c-6 1-10 6-10 12v13',
  pickup: 'M10 62h14m34 0h70m34 0h18V40h-58V22c0-4-3-6-7-6H74c-4 0-7 2-9 5L52 38l-32 4c-6 1-10 6-10 12v8',
};

function shapeFor(body) {
  if (body === 'Pick-up' || body === 'Utilitaire') return 'pickup';
  if (['SUV', 'Crossover', 'Monospace'].includes(body)) return 'tall';
  return 'low';
}

export default function CarVisual({ src, alt, body, credit, sizes = 'thumb' }) {
  if (src) {
    return (
      <span className={`pub-visual has-photo ${sizes}`}>
        <img src={src} alt={alt} loading="lazy" decoding="async" />
        {credit && <span className="pub-credit">{credit}</span>}
      </span>
    );
  }
  return (
    <span className={`pub-visual ${sizes}`} role="img" aria-label={`${alt} — photo à venir`}>
      <svg viewBox="0 0 200 80" fill="none" aria-hidden="true">
        <path d={SHAPES[shapeFor(body)]} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="41" cy="62" r="11" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="145" cy="62" r="11" stroke="currentColor" strokeWidth="2.5" />
      </svg>
    </span>
  );
}
