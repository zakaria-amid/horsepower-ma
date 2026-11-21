import AdminShell from '../../../components/AdminShell';
import { requireAdmin } from '../../../lib/session';
import { ensureSchema, q } from '../../../lib/db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Leads — Admin Horsepower.ma' };

function when(value) {
  return new Date(value).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Casablanca' });
}

export default async function LeadsPage() {
  const session = await requireAdmin();
  await ensureSchema();
  const leads = await q('select * from leads order by created_at desc limit 500');
  return (
    <AdminShell active="leads" title="Leads" email={session.e}>
      <section className="panel">
        <h2>
          {leads.length} demande{leads.length > 1 ? 's' : ''}
        </h2>
        {leads.length === 0 ? (
          <p className="empty">Aucune demande pour l'instant. Elles arrivent depuis l'accueil, les fiches modèles et la page contact.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Prénom</th>
                  <th>Téléphone</th>
                  <th>Modèle</th>
                  <th>Ville</th>
                  <th>Origine</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td>{when(l.created_at)}</td>
                    <td className="strong">{l.first_name || '—'}</td>
                    <td>
                      <a className="muted-link" href={`https://wa.me/${String(l.phone).replace(/\D/g, '').replace(/^0/, '212')}`} target="_blank" rel="noopener">
                        {l.phone}
                      </a>
                    </td>
                    <td>{l.model_wanted || '—'}</td>
                    <td>{l.city || '—'}</td>
                    <td>{l.source}</td>
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
