import { Breadcrumb } from './SiteChrome';

export default function ComingSoon({ kicker, title, text, links = [] }) {
  return (
    <main className="pub-wrap pub-page">
      <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: kicker }]} />
      <section className="pub-soon">
        <span className="pub-kicker">{kicker} · Bientôt</span>
        <h1>{title}</h1>
        <p>{text}</p>
        <div className="pub-actions">
          <a href="/neuf" className="pub-btn red">
            Voir les voitures neuves →
          </a>
          {links.map((l) => (
            <a key={l.href} href={l.href} className="pub-btn line">
              {l.label}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
