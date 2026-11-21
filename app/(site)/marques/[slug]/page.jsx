import { notFound } from 'next/navigation';
import ModelCard from '../../../../components/site/ModelCard';
import { Breadcrumb } from '../../../../components/site/SiteChrome';
import { getBrand, getModels } from '../../../../lib/public';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: 'Marque introuvable — Horsepower.ma' };
  return {
    title: `Prix ${brand.name} neuve au Maroc 2026 : tous les modèles — Horsepower.ma`,
    description: `Tous les modèles ${brand.name} vendus au Maroc avec leurs prix publics, versions et fiches techniques.`,
    alternates: { canonical: `/marques/${brand.slug}` },
  };
}

export default async function BrandPage({ params }) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();
  const models = await getModels({ brand: brand.slug });

  return (
    <main className="pub-wrap pub-page">
      <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Marques', href: '/marques' }, { label: brand.name }]} />
      <header className="pub-head">
        <h1>Prix {brand.name} neuve au Maroc</h1>
        <p>
          {models.length} modèle{models.length > 1 ? 's' : ''} {brand.name} vendu{models.length > 1 ? 's' : ''} au Maroc
          {brand.country ? ` · marque originaire de ${brand.country}` : ''}.
        </p>
        {brand.website && (
          <a href={brand.website} target="_blank" rel="noopener nofollow" className="pub-link">
            Site officiel {brand.name} Maroc ↗
          </a>
        )}
      </header>
      {models.length === 0 ? (
        <div className="pub-empty">
          <p>Les modèles {brand.name} arrivent bientôt.</p>
        </div>
      ) : (
        <div className="pub-grid">
          {models.map((m) => (
            <ModelCard key={m.id} m={m} />
          ))}
        </div>
      )}
    </main>
  );
}
