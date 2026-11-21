import CarVisual from '../../../components/site/CarVisual';
import { Breadcrumb } from '../../../components/site/SiteChrome';
import { getBrands } from '../../../lib/public';

export const revalidate = 300;

export const metadata = {
  title: 'Toutes les marques automobiles au Maroc — Horsepower.ma',
  description: 'Les marques de voitures neuves vendues au Maroc et leurs modèles, avec les prix publics.',
  alternates: { canonical: '/marques' },
};

export default async function BrandsPage() {
  const brands = await getBrands();
  return (
    <main className="pub-wrap pub-page">
      <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Marques' }]} />
      <header className="pub-head">
        <h1>Prix par marque</h1>
        <p>Choisissez une marque pour voir tous ses modèles vendus au Maroc.</p>
      </header>
      <div className="pub-grid brands">
        {brands.map((b) => (
          <a key={b.slug} href={`/marques/${b.slug}`} className="pub-brand">
            <CarVisual src={b.thumb_url} alt={b.name} body="SUV" />
            <span className="pub-brand-name">{b.name}</span>
            <span className="muted">
              {b.model_count} modèle{b.model_count > 1 ? 's' : ''}
              {b.country ? ` · ${b.country}` : ''}
            </span>
          </a>
        ))}
      </div>
    </main>
  );
}
