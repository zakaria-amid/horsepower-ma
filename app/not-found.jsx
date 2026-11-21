import { SiteHeader, SiteFooter } from '../components/site/SiteChrome';

export default function NotFound() {
  return (
    <div className="pub">
      <SiteHeader />
      <main className="pub-wrap pub-page">
        <section className="pub-soon">
          <span className="pub-kicker">Erreur 404</span>
          <h1>Page introuvable</h1>
          <p>Cette page n'existe pas ou a été déplacée.</p>
          <div className="pub-actions">
            <a href="/neuf" className="pub-btn red">Voir les voitures neuves →</a>
            <a href="/" className="pub-btn line">Accueil</a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
