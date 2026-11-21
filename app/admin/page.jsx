import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { readSession, SESSION_COOKIE } from '../../lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Tableau de bord — Admin Horsepower.ma' };

const NAV = [
  { label: 'Tableau de bord', active: true },
  { label: 'Marques' },
  { label: 'Modèles & versions' },
  { label: 'Promos' },
  { label: 'Essais vidéo' },
  { label: 'Comparatifs' },
  { label: 'Leads' },
  { label: 'Imports automatiques' },
  { label: 'Réglages' },
];

const STATS = [
  { label: 'Marques', hint: 'Catalogue' },
  { label: 'Modèles', hint: 'Fiches publiées' },
  { label: 'Promos actives', hint: 'En cours' },
  { label: 'Leads', hint: '30 derniers jours' },
];

const STEPS = [
  { title: 'Domaine horsepower.ma', text: 'Connecté à Vercel, HTTPS actif.', done: true },
  { title: 'Espace admin sécurisé', text: 'Connexion par e-mail et mot de passe.', done: true },
  { title: 'Base de données Neon', text: 'À connecter pour enregistrer marques, modèles et prix.' },
  { title: 'Catalogue', text: 'Saisie des 50 modèles les plus vendus.' },
  { title: 'Imports automatiques', text: 'Robots par marque, avec validation avant publication.' },
];

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = readSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect('/admin/login');

  return (
    <div className="admin">
      <aside className="side">
        <div className="logo">
          HORSEPOWER<span>.ma</span>
        </div>
        <nav aria-label="Menu admin">
          {NAV.map((item) => (
            <a key={item.label} href="/admin" className={item.active ? 'active' : undefined} aria-current={item.active ? 'page' : undefined}>
              {item.label}
              {!item.active && <span className="tag-soon">Bientôt</span>}
            </a>
          ))}
        </nav>
        <div className="side-foot">Admin · v0.1</div>
      </aside>

      <main className="main">
        <div className="topbar">
          <h1>Tableau de bord</h1>
          <div className="who">
            <span>{session.e}</span>
            <form method="post" action="/api/admin/logout">
              <button className="btn-ghost" type="submit">
                Se déconnecter
              </button>
            </form>
          </div>
        </div>

        <div className="notice" role="status">
          <div>
            <b>Base de données pas encore connectée</b>
            <span>Les sections du menu s'activeront dès que la base Neon sera reliée au projet Vercel.</span>
          </div>
        </div>

        <section className="stats" aria-label="Chiffres clés">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <span className="label">{s.label}</span>
              <span className="value">—</span>
              <span className="hint">{s.hint}</span>
            </div>
          ))}
        </section>

        <div className="grid2">
          <section className="panel">
            <h2>Mise en place</h2>
            <ol className="steps">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <span className={s.done ? 'n done' : 'n'}>{s.done ? '✓' : i + 1}</span>
                  <div>
                    <b>{s.title}</b>
                    <span>{s.text}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel">
            <h2>Imports automatiques</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Type</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Sites des importateurs au Maroc</td>
                    <td>Prix et versions</td>
                    <td><span className="pill">À configurer</span></td>
                  </tr>
                  <tr>
                    <td>Sites internationaux des marques</td>
                    <td>Fiches techniques</td>
                    <td><span className="pill">À configurer</span></td>
                  </tr>
                  <tr>
                    <td>Partenariats importateurs</td>
                    <td>Fichier de prix mensuel</td>
                    <td><span className="pill">À configurer</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="panel">
          <h2>Raccourcis</h2>
          <div className="quick">
            <a href="/" target="_blank" rel="noopener">Voir le site <span aria-hidden="true">↗</span></a>
            <a href="https://vercel.com/zakaria-amids-projects/horsepower-ma" target="_blank" rel="noopener">Projet Vercel <span aria-hidden="true">↗</span></a>
            <a href="https://github.com/zakaria-amid/horsepower-ma" target="_blank" rel="noopener">Code GitHub <span aria-hidden="true">↗</span></a>
          </div>
        </section>
      </main>
    </div>
  );
}
