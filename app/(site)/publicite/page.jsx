import ComingSoon from '../../../components/site/ComingSoon';
export const metadata = { title: 'Publicité et partenariats — Horsepower.ma', alternates: { canonical: '/publicite' } };
export default function Page() {
  return <ComingSoon kicker="Publicité" title="Marques et concessionnaires" text="Essais vidéo sponsorisés, mise en avant de vos promos et réception de leads qualifiés : contactez-nous pour construire un partenariat." links={[{ href: '/contact', label: 'Nous contacter' }]} />;
}
