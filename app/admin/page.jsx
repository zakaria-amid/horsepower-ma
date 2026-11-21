import AdminShell from '../../components/AdminShell';
import { requireAdmin } from '../../lib/session';
import { ensureSchema, q } from '../../lib/db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Tableau de bord — Admin Horsepower.ma' };

async function loadStats() {
  try {
    await ensureSchema();
    const [row] = await q(`select
      (select count(*) from brands)::int as brands,
      (select count(*) from models)::int as models,
      (select count(*) from models where status = 'publié')::int as published,
      (select count(*) from versions)::int as versions,
      (select count(*) from versions where price_mad is not null)::int as priced,
      (select count(*) from leads where created_at > now() - interval '30 days')::int as leads`);
    return { ok: true, ...row };
  } catch (err) {
    console.error(err);
    return { ok: false };
  }
}

export default async function AdminPage() {
  const session = await requireAdmin();
  const s = await loadStats();

  const stats = [
    { label: 'Marques', value: s.brands, hint: 'Dans le catalogue', href: '/admin/marques' },
    { label: 'Modèles', value: s.models, hint: s.ok ? `${s.published} publiés` : '', href: '/admin/modeles' },
    { label: 'Versions', value: s.versions, hint: s.ok ? `${s.priced} avec un prix` : '', href: '/admin/modeles' },
    { label: 'Leads', value: s.leads, hint: '30 derniers jours' },
  ];

  const steps = [
    { title: 'Domaine horsepower.ma', text: 'Connecté à Vercel, HTTPS actif.', done: true },
    { title: 'Espace admin sécurisé', text: 'Connexion par e-mail et mot de passe.', done: true },
    { title: 'Base de données Neon', text: s.ok ? 'Connectée (Frankfurt).' : 'Connexion impossible pour le moment.', done: s.ok },
    { title: 'Catalogue', text: 'Saisir les marques, puis les 50 modèles les plus vendus avec leurs versions et prix.', done: s.ok && s.models >= 50 },
    { title: 'Pages publiques', text: 'Fiches modèles, prix par marque et classement DH/ch générés depuis la base.' },
    { title: 'Imports automatiques', text: 'Robots par marque, avec validation avant publication.' },
  ];

  return (
    <AdminShell active="dashboard" title="Tableau de bord" email={session.e}>
      {!s.ok && (
        <div className="alert" role="alert">
          La base de données ne répond pas. Vérifiez l'intégration Neon dans Vercel.
        </div>
      )}

      <section className="stats" aria-label="Chiffres clés">
        {stats.map((item) => {
          const inner = (
            <>
              <span className="label">{item.label}</span>
              <span className="value">{s.ok ? item.value : '—'}</span>
              <span className="hint">{item.hint}</span>
            </>
          );
          return item.href ? (
            <a className="stat" href={item.href} key={item.label}>
              {inner}
            </a>
          ) : (
            <div className="stat" key={item.label}>
              {inner}
            </div>
          );
        })}
      </section>

      <div className="grid2">
        <section className="panel">
          <h2>Mise en place</h2>
          <ol className="steps">
            {steps.map((step, i) => (
              <li key={step.title}>
                <span className={step.done ? 'n done' : 'n'}>{step.done ? '✓' : i + 1}</span>
                <div>
                  <b>{step.title}</b>
                  <span>{step.text}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="panel">
          <h2>Raccourcis</h2>
          <div className="quick">
            <a href="/admin/marques">Ajouter une marque <span aria-hidden="true">→</span></a>
            <a href="/admin/modeles">Ajouter un modèle <span aria-hidden="true">→</span></a>
            <a href="/" target="_blank" rel="noopener">Voir le site <span aria-hidden="true">↗</span></a>
            <a href="https://vercel.com/zakaria-amids-projects/horsepower-ma" target="_blank" rel="noopener">Projet Vercel <span aria-hidden="true">↗</span></a>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
