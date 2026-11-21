import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { readSession, SESSION_COOKIE } from '../../../lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Connexion — Admin Horsepower.ma' };

export default async function LoginPage({ searchParams }) {
  const cookieStore = await cookies();
  if (readSession(cookieStore.get(SESSION_COOKIE)?.value)) redirect('/admin');

  const params = (await searchParams) || {};
  const hasError = Boolean(params.erreur);

  return (
    <main className="login">
      <section className="login-brand" aria-hidden="false">
        <div className="logo">
          HORSEPOWER<span>.ma</span>
        </div>
        <h1>
          Espace
          <br />
          <em>admin.</em>
        </h1>
        <p>Gestion du catalogue, des essais, des promos et des leads.</p>
      </section>

      <section className="login-panel">
        <form className="login-card" method="post" action="/api/admin/login">
          <h2>Connexion</h2>
          <p className="sub">Accès réservé à l'administrateur.</p>

          {hasError && (
            <div className="alert" role="alert">
              E-mail ou mot de passe incorrect.
            </div>
          )}

          <label className="field">
            E-mail
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label className="field">
            Mot de passe
            <input type="password" name="password" autoComplete="current-password" required />
          </label>

          <button className="btn-primary" type="submit">
            Se connecter
          </button>
          <a className="back" href="/">
            ← Retour au site
          </a>
        </form>
      </section>
    </main>
  );
}
