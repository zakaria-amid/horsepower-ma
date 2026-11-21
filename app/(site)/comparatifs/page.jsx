import ComingSoon from '../../../components/site/ComingSoon';
export const metadata = { title: 'Comparatifs voitures neuves au Maroc — Horsepower.ma', alternates: { canonical: '/comparatifs' } };
export default function Page() {
  return <ComingSoon kicker="Comparatifs" title="Face à face" text="Prix, puissance, équipements et prix par cheval : nos comparatifs entre modèles concurrents arrivent bientôt." links={[{ href: '/marques', label: 'Parcourir les marques' }]} />;
}
