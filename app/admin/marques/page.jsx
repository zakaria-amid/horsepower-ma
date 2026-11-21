import AdminShell, { Flash } from '../../../components/AdminShell';
import { requireAdmin } from '../../../lib/session';
import { ensureSchema, q } from '../../../lib/db';
import { createBrand, deleteBrand } from '../actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Marques — Admin Horsepower.ma' };

export default async function BrandsPage({ searchParams }) {
  const session = await requireAdmin();
  const params = (await searchParams) || {};
  await ensureSchema();
  const brands = await q(`
    select b.*, count(m.id)::int as model_count
    from brands b left join models m on m.brand_id = b.id
    group by b.id order by b.name`);

  return (
    <AdminShell active="marques" title="Marques" email={session.e}>
      <Flash params={params} />

      <section className="panel">
        <h2>Ajouter une marque</h2>
        <form action={createBrand} className="form-row">
          <label className="field">
            Nom
            <input name="name" required maxLength={80} placeholder="ex. Dacia" />
          </label>
          <label className="field">
            Pays d'origine
            <input name="country" maxLength={60} placeholder="ex. Roumanie" />
          </label>
          <label className="field grow">
            Site officiel au Maroc
            <input name="website" maxLength={500} placeholder="ex. www.dacia.ma" />
          </label>
          <button className="btn-primary" type="submit">
            Ajouter
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>
          {brands.length} marque{brands.length > 1 ? 's' : ''}
        </h2>
        {brands.length === 0 ? (
          <p className="empty">Aucune marque pour l'instant. Commencez par celles que vous filmerez en premier.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Marque</th>
                  <th>Pays</th>
                  <th>Site officiel</th>
                  <th>Modèles</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <a className="strong" href={`/admin/marques/${b.id}`}>
                        {b.name}
                      </a>
                    </td>
                    <td>{b.country || '—'}</td>
                    <td>
                      {b.website ? (
                        <a href={b.website} target="_blank" rel="noopener" className="muted-link">
                          {b.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <a href={`/admin/modeles?marque=${b.id}`} className="muted-link">
                        {b.model_count}
                      </a>
                    </td>
                    <td>
                      <span className={b.active ? 'pill ok' : 'pill'}>{b.active ? 'Active' : 'Masquée'}</span>
                    </td>
                    <td className="row-actions">
                      <a href={`/admin/marques/${b.id}`} className="link-btn">
                        Modifier
                      </a>
                      <details className="confirm">
                        <summary className="link-btn danger">Supprimer</summary>
                        <form action={deleteBrand}>
                          <input type="hidden" name="id" value={b.id} />
                          <span>Supprimer aussi ses {b.model_count} modèle(s) ?</span>
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
