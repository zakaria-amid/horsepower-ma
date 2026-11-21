import AdminShell, { Flash, formatPrice } from '../../../components/AdminShell';
import { requireAdmin } from '../../../lib/session';
import { ensureSchema, q, BODY_TYPES, FUELS, STATUSES } from '../../../lib/db';
import { createModel, deleteModel } from '../actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Modèles — Admin Horsepower.ma' };

export default async function ModelsPage({ searchParams }) {
  const session = await requireAdmin();
  const params = (await searchParams) || {};
  const brandFilter = Number.parseInt(params.marque, 10);
  const hasFilter = Number.isFinite(brandFilter);
  await ensureSchema();

  const brands = await q('select id, name from brands order by name');
  const models = await q(
    `select m.*, b.name as brand_name,
            count(v.id)::int as version_count,
            min(v.price_mad) as min_price
       from models m
       join brands b on b.id = m.brand_id
       left join versions v on v.model_id = m.id
      where ($1::int is null or m.brand_id = $1)
      group by m.id, b.name
      order by b.name, m.name`,
    [hasFilter ? brandFilter : null]
  );
  const currentBrand = hasFilter ? brands.find((b) => b.id === brandFilter) : null;

  return (
    <AdminShell active="modeles" title="Modèles & versions" email={session.e}>
      <Flash params={params} />

      {brands.length === 0 ? (
        <section className="panel">
          <h2>Ajoutez d'abord une marque</h2>
          <p className="empty">Un modèle appartient toujours à une marque.</p>
          <a className="btn-primary inline" href="/admin/marques">
            Ajouter une marque
          </a>
        </section>
      ) : (
        <section className="panel">
          <h2>Ajouter un modèle</h2>
          <form action={createModel} className="form-row">
            <label className="field">
              Marque
              <select name="brand_id" required defaultValue={currentBrand ? String(currentBrand.id) : ''}>
                <option value="" disabled>
                  Choisir…
                </option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field grow">
              Nom du modèle
              <input name="name" required maxLength={80} placeholder="ex. Duster" />
            </label>
            <label className="field">
              Carrosserie
              <select name="body_type" defaultValue="">
                <option value="">—</option>
                {BODY_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Énergie
              <select name="fuel" defaultValue="">
                <option value="">—</option>
                {FUELS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Statut
              <select name="status" defaultValue="brouillon">
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st === 'publié' ? 'Publié' : 'Brouillon'}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn-primary" type="submit">
              Ajouter
            </button>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="panel-head">
          <h2>
            {models.length} modèle{models.length > 1 ? 's' : ''}
            {currentBrand ? ` · ${currentBrand.name}` : ''}
          </h2>
          {brands.length > 0 && (
            <form method="get" className="filter">
              <label className="sr-only" htmlFor="marque">
                Filtrer par marque
              </label>
              <select id="marque" name="marque" defaultValue={currentBrand ? String(currentBrand.id) : ''}>
                <option value="">Toutes les marques</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-ghost">
                Filtrer
              </button>
            </form>
          )}
        </div>

        {models.length === 0 ? (
          <p className="empty">Aucun modèle pour l'instant.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Modèle</th>
                  <th>Marque</th>
                  <th>Carrosserie</th>
                  <th>Énergie</th>
                  <th>Versions</th>
                  <th>Prix dès</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <a className="strong" href={`/admin/modeles/${m.id}`}>
                        {m.name}
                      </a>
                    </td>
                    <td>{m.brand_name}</td>
                    <td>{m.body_type || '—'}</td>
                    <td>{m.fuel || '—'}</td>
                    <td>{m.version_count}</td>
                    <td>{formatPrice(m.min_price)}</td>
                    <td>
                      <span className={m.status === 'publié' ? 'pill ok' : 'pill'}>{m.status === 'publié' ? 'Publié' : 'Brouillon'}</span>
                    </td>
                    <td className="row-actions">
                      <a href={`/admin/modeles/${m.id}`} className="link-btn">
                        Gérer
                      </a>
                      <details className="confirm">
                        <summary className="link-btn danger">Supprimer</summary>
                        <form action={deleteModel}>
                          <input type="hidden" name="id" value={m.id} />
                          <span>Supprimer aussi ses {m.version_count} version(s) ?</span>
                          <button type="submit" className="btn-danger">
                            Oui, supprimer
                          </button>
                        </form>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
