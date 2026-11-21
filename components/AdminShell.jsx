const NAV = [
  { key: 'dashboard', label: 'Tableau de bord', href: '/admin' },
  { key: 'marques', label: 'Marques', href: '/admin/marques' },
  { key: 'modeles', label: 'Modèles & versions', href: '/admin/modeles' },
  { key: 'promos', label: 'Promos' },
  { key: 'essais', label: 'Essais vidéo' },
  { key: 'comparatifs', label: 'Comparatifs' },
  { key: 'leads', label: 'Leads', href: '/admin/leads' },
  { key: 'imports', label: 'Imports automatiques' },
  { key: 'reglages', label: 'Réglages' },
];

export default function AdminShell({ active, title, email, actions, children }) {
  return (
    <div className="admin">
      <aside className="side">
        <a className="logo" href="/admin">
          HORSEPOWER<span>.ma</span>
        </a>
        <nav aria-label="Menu admin">
          {NAV.map((item) =>
            item.href ? (
              <a
                key={item.key}
                href={item.href}
                className={active === item.key ? 'active' : undefined}
                aria-current={active === item.key ? 'page' : undefined}
              >
                {item.label}
              </a>
            ) : (
              <span key={item.key} className="nav-soon">
                {item.label}
                <span className="tag-soon">Bientôt</span>
              </span>
            )
          )}
        </nav>
        <div className="side-foot">Admin · v0.2</div>
      </aside>

      <main className="main">
        <div className="topbar">
          <h1>{title}</h1>
          <div className="who">
            {actions}
            <span className="email">{email}</span>
            <form method="post" action="/api/admin/logout">
              <button className="btn-ghost" type="submit">
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

export function Flash({ params }) {
  if (params?.erreur) {
    return (
      <div className="alert" role="alert">
        {String(params.erreur)}
      </div>
    );
  }
  if (params?.ok) {
    return (
      <div className="success" role="status">
        {String(params.ok)}
      </div>
    );
  }
  return null;
}

export function formatPrice(value) {
  if (value === null || value === undefined || value === '') return '—';
  return `${Number(value).toLocaleString('fr-FR').replace(/ | /g, ' ')} DH`;
}

export function pricePerHp(price, hp) {
  if (!price || !hp) return '—';
  return `${Math.round(Number(price) / Number(hp)).toLocaleString('fr-FR').replace(/ | /g, ' ')} DH`;
}
