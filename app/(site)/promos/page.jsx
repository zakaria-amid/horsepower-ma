import ComingSoon from '../../../components/site/ComingSoon';
export const metadata = { title: 'Promos voitures neuves au Maroc — Horsepower.ma', alternates: { canonical: '/promos' } };
export default function Page() {
  return <ComingSoon kicker="Promos" title="Les promos du mois, toutes marques" text="Remises, reprises et financements : nous rassemblons les offres des concessionnaires. Première sélection très bientôt." links={[{ href: '/contact', label: 'Être alerté' }]} />;
}
