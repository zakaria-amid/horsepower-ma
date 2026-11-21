import CarVisual from './CarVisual';
import { money } from '../../lib/public';

export default function ModelCard({ m }) {
  const href = `/neuf/${m.brand_slug}/${m.slug}`;
  const title = `${m.brand_name} ${m.name}`;
  return (
    <a href={href} className="pub-card">
      <CarVisual src={m.thumb_url} alt={title} body={m.body_type} credit={m.credit} />
      <span className="pub-card-body">
        <span className="pub-kicker">{[m.body_type, m.fuel].filter(Boolean).join(' · ') || m.brand_name}</span>
        <span className="pub-card-title">{title}</span>
        <span className="pub-card-price">
          {m.min_price ? (
            <>
              <span className="muted">Dès</span> <strong>{money(m.min_price)}</strong>
            </>
          ) : (
            <span className="muted">Prix bientôt</span>
          )}
        </span>
      </span>
    </a>
  );
}
