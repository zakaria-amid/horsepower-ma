import { notFound } from 'next/navigation';
import CarVisual from '../../../../../components/site/CarVisual';
import LeadForm from '../../../../../components/site/LeadForm';
import ModelCard from '../../../../../components/site/ModelCard';
import { Breadcrumb } from '../../../../../components/site/SiteChrome';
import { getModel, getModels, money } from '../../../../../lib/public';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { marque, modele } = await params;
  const m = await getModel(marque, modele);
  if (!m) return { title: 'Modèle introuvable — Horsepower.ma' };
  const title = `${m.brand_name} ${m.name}`;
  const minPrice = m.versions.find((v) => v.price_mad)?.price_mad;
  return {
    title: `Prix ${title} neuve au Maroc 2026 — Horsepower.ma`,
    description: minPrice
      ? `${title} au Maroc dès ${money(minPrice)} : versions, puissance, prix par cheval et fiche technique.`
      : `${title} au Maroc : versions, fiche technique et prix bientôt disponibles.`,
    alternates: { canonical: `/neuf/${m.brand_slug}/${m.slug}` },
    openGraph: m.photos[0] ? { images: [m.photos[0].url] } : undefined,
  };
}

export default async function ModelPage({ params }) {
  const { marque, modele } = await params;
  const m = await getModel(marque, modele);
  if (!m) notFound();

  const title = `${m.brand_name} ${m.name}`;
  const priced = m.versions.filter((v) => v.price_mad);
  const minPrice = priced.length ? Math.min(...priced.map((v) => v.price_mad)) : null;
  const withHp = priced.filter((v) => v.power_hp);
  const bestDhHp = withHp.length ? Math.min(...withHp.map((v) => Math.round(v.price_mad / v.power_hp))) : null;
  const maxHp = m.versions.filter((v) => v.power_hp).reduce((acc, v) => Math.max(acc, v.power_hp), 0) || null;
  const cover = m.photos[0];
  const others = (await getModels({ brand: m.brand_slug })).filter((x) => x.id !== m.id).slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: title,
    brand: { '@type': 'Brand', name: m.brand_name },
    bodyType: m.body_type || undefined,
    fuelType: m.fuel || undefined,
    image: m.photos.map((p) => p.url),
    offers: minPrice ? { '@type': 'AggregateOffer', priceCurrency: 'MAD', lowPrice: minPrice, offerCount: priced.length } : undefined,
  };

  return (
    <main className="pub-wrap pub-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Neuf', href: '/neuf' },
          { label: m.brand_name, href: `/marques/${m.brand_slug}` },
          { label: m.name },
        ]}
      />

      <section className="pub-model">
        <div className="pub-gallery">
          <CarVisual
            src={cover?.url}
            alt={cover?.alt || title}
            body={m.body_type}
            credit={cover?.credit}
            sizes="large"
          />
          {m.photos.length > 1 && (
            <div className="pub-thumbs">
              {m.photos.slice(1, 9).map((p) => (
                <a key={p.id} href={p.url} target="_blank" rel="noopener">
                  <img src={p.thumb_url} alt={p.alt || title} loading="lazy" decoding="async" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="pub-model-info">
          <span className="pub-kicker">{[m.body_type, m.fuel].filter(Boolean).join(' · ')}</span>
          <h1>Prix {title} neuve au Maroc</h1>
          <dl className="pub-facts">
            <div>
              <dt>Prix dès</dt>
              <dd>{minPrice ? money(minPrice) : 'Bientôt'}</dd>
            </div>
            <div>
              <dt>Puissance max</dt>
              <dd>{maxHp ? `${maxHp} ch` : '—'}</dd>
            </div>
            <div>
              <dt>Prix par cheval</dt>
              <dd>{bestDhHp ? money(bestDhHp) : '—'}</dd>
            </div>
            <div>
              <dt>Versions</dt>
              <dd>{m.versions.length || '—'}</dd>
            </div>
          </dl>
          <a href="#offre" className="pub-btn red">
            Recevoir une offre →
          </a>
          {m.brand_website && (
            <a href={m.brand_website} target="_blank" rel="noopener nofollow" className="pub-link">
              Site officiel {m.brand_name} Maroc ↗
            </a>
          )}
        </div>
      </section>

      <section className="pub-section">
        <h2>Versions et prix</h2>
        {m.versions.length === 0 ? (
          <p className="pub-empty-line">
            Les versions et prix du {title} sont en cours de vérification auprès de l'importateur. Laissez vos coordonnées ci-dessous
            pour recevoir l'offre officielle.
          </p>
        ) : (
          <div className="pub-table-wrap">
            <table className="pub-table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Énergie</th>
                  <th>Boîte</th>
                  <th>Puissance</th>
                  <th>Prix</th>
                  <th>DH / ch</th>
                </tr>
              </thead>
              <tbody>
                {m.versions.map((v) => (
                  <tr key={v.id}>
                    <td className="strong">{v.name}</td>
                    <td>{v.fuel || '—'}</td>
                    <td>{v.gearbox || '—'}</td>
                    <td>{v.power_hp ? `${v.power_hp} ch` : '—'}</td>
                    <td className="strong">{money(v.price_mad) || 'Sur demande'}</td>
                    <td>{v.price_mad && v.power_hp ? money(Math.round(v.price_mad / v.power_hp)) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="pub-note">Prix publics au Maroc, hors frais d'immatriculation et peinture métallisée, susceptibles d'évoluer.</p>
      </section>

      <div id="offre">
        <LeadForm model={title} source={`fiche:${m.brand_slug}/${m.slug}`} />
      </div>

      {others.length > 0 && (
        <section className="pub-section">
          <h2>Autres modèles {m.brand_name}</h2>
          <div className="pub-grid">
            {others.map((o) => (
              <ModelCard key={o.id} m={o} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
