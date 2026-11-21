import ModelCard from '../../../components/site/ModelCard';
import { Breadcrumb } from '../../../components/site/SiteChrome';
import { getBrands, getModels, BUDGETS } from '../../../lib/public';
import { BODY_TYPES, FUELS } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Voitures neuves au Maroc : prix et catalogue 2026 — Horsepower.ma',
  description: 'Catalogue des voitures neuves vendues au Maroc : toutes les marques, carrosseries et énergies, avec les prix publics.',
  alternates: { canonical: '/neuf' },
};

function clean(value, allowed) {
  const v = typeof value === 'string' ? value : '';
  return allowed ? (allowed.includes(v) ? v : null) : v || null;
}

export default async function NeufPage({ searchParams }) {
  const params = (await searchParams) || {};
  const brands = await getBrands();
  const brand = clean(params.marque, brands.map((b) => b.slug));
  const body = clean(params.carrosserie, BODY_TYPES);
  const fuel = clean(params.energie, FUELS);
  const budget = BUDGETS.find((b) => String(b.value) === params.budget)?.value || null;
  const models = await getModels({ brand, body, fuel, maxPrice: budget });
  const filtered = Boolean(brand || body || fuel || budget);

  return (
    <main className="pub-wrap pub-page">
      <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Voitures neuves' }]} />
      <header className="pub-head">
        <h1>Voitures neuves au Maroc</h1>
        <p>Toutes les marques vendues au Maroc, avec les prix publics hors frais d'immatriculation.</p>
      </header>

      <form method="get" action="/neuf" className="pub-filters">
        <label>
          Marque
          <select name="marque" defaultValue={brand || ''}>
            <option value="">Toutes</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Carrosserie
          <select name="carrosserie" defaultValue={body || ''}>
            <option value="">Toutes</option>
            {BODY_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Énergie
          <select name="energie" defaultValue={fuel || ''}>
            <option value="">Toutes</option>
            {FUELS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label>
          Budget
          <select name="budget" defaultValue={budget ? String(budget) : ''}>
            <option value="">Tous</option>
            {BUDGETS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Filtrer</button>
        {filtered && (
          <a href="/neuf" className="pub-reset">
            Effacer
          </a>
        )}
      </form>

      <p className="pub-count">
        {models.length} modèle{models.length > 1 ? 's' : ''}
      </p>
      {models.length === 0 ? (
        <div className="pub-empty">
          <p>Aucun modèle ne correspond à ces critères pour le moment.</p>
          {budget && <p>Les prix sont en cours de vérification : le filtre budget n'affiche que les modèles dont le prix est publié.</p>}
          <a href="/neuf" className="pub-btn line">
            Voir tout le catalogue
          </a>
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
