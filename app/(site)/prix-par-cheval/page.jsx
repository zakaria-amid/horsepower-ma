import { Breadcrumb } from '../../../components/site/SiteChrome';
import { getRanking, money } from '../../../lib/public';

export const revalidate = 300;

export const metadata = {
  title: 'Combien coûte un cheval ? Classement prix / puissance au Maroc — Horsepower.ma',
  description: 'Le classement exclusif Horsepower : les voitures neuves au Maroc qui offrent le plus de chevaux pour le prix.',
  alternates: { canonical: '/prix-par-cheval' },
};

export default async function RankingPage() {
  const rows = await getRanking(100);
  return (
    <main className="pub-wrap pub-page">
      <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Prix / cheval' }]} />
      <header className="pub-head">
        <span className="pub-kicker">Exclusivité Horsepower</span>
        <h1>Combien coûte un cheval&#160;?</h1>
        <p>Le prix public divisé par la puissance. Plus le chiffre est bas, plus la voiture vous en donne pour votre argent.</p>
      </header>
      {rows.length === 0 ? (
        <div className="pub-empty">
          <p>Le classement est en cours de préparation : il s'affichera dès que les premiers prix et puissances seront vérifiés.</p>
          <a href="/neuf" className="pub-btn line">
            Voir les voitures neuves
          </a>
        </div>
      ) : (
        <div className="pub-table-wrap dark">
          <table className="pub-table">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Modèle</th>
                <th>Version</th>
                <th>Prix</th>
                <th>Puissance</th>
                <th>DH / ch</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td className="rank">{String(i + 1).padStart(2, '0')}</td>
                  <td>
                    <a href={`/neuf/${r.brand_slug}/${r.model_slug}`} className="strong">
                      {r.brand_name} {r.model_name}
                    </a>
                  </td>
                  <td>{r.version_name}</td>
                  <td>{money(r.price_mad)}</td>
                  <td>{r.power_hp} ch</td>
                  <td className="strong">{money(r.dh_per_hp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
