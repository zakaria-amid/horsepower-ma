const NAV = [
  { href: '/neuf', label: 'Neuf' },
  { href: '/marques', label: 'Marques' },
  { href: '/essais', label: 'Essais' },
  { href: '/comparatifs', label: 'Comparatifs' },
  { href: '/promos', label: 'Promos' },
  { href: '/prix-par-cheval', label: 'Prix / cheval' },
];

export function SiteHeader() {
  return (
    <div className="pub-top">
      <header className="pub-header">
        <a href="/" className="pub-logo" aria-label="horsepower.ma, accueil">
          HORSEPOWER<span>.ma</span>
        </a>
        <nav aria-label="Navigation principale" className="pub-nav">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a href="/neuf" className="pub-cta">
          Trouver ma voiture <span aria-hidden="true">→</span>
        </a>
      </header>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="pub-footer">
      <div className="pub-wrap pub-footer-grid">
        <div className="pub-footer-brand">
          <span className="pub-logo light">
            HORSEPOWER<span>.ma</span>
          </span>
          <p>Prix des voitures neuves au Maroc, essais vidéo et comparatifs.</p>
        </div>
        <nav aria-label="Pied de page" className="pub-footer-links">
          <a href="/neuf">Voitures neuves</a>
          <a href="/neuf?energie=%C3%89lectrique">Électrique</a>
          <a href="/neuf?energie=Hybride">Hybride</a>
          <a href="/marques">Toutes les marques</a>
          <a href="/prix-par-cheval">Prix / cheval</a>
          <a href="/essais">Essais vidéo</a>
          <a href="/comparatifs">Comparatifs</a>
          <a href="/promos">Promos</a>
          <a href="/actualites">Actualités</a>
          <a href="/publicite">Publicité</a>
          <a href="/contact">Contact</a>
        </nav>
      </div>
      <div className="pub-wrap pub-footer-bottom">
        <span>Prix publics au Maroc, hors frais d'immatriculation et peinture métallisée.</span>
        <span>© horsepower.ma</span>
      </div>
    </footer>
  );
}

export function Breadcrumb({ items }) {
  return (
    <nav aria-label="Fil d'Ariane" className="pub-breadcrumb">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span aria-hidden="true"> / </span>}
          {item.href ? <a href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
