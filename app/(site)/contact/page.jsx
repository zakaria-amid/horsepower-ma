import { Breadcrumb } from '../../../components/site/SiteChrome';
import LeadForm from '../../../components/site/LeadForm';
export const metadata = { title: 'Contact — Horsepower.ma', alternates: { canonical: '/contact' } };
export default function Page() {
  return (
    <main className="pub-wrap pub-page">
      <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Contact' }]} />
      <header className="pub-head">
        <h1>Contact</h1>
        <p>Une question, une demande d'offre ou un partenariat ? Laissez vos coordonnées, nous vous rappelons.</p>
      </header>
      <LeadForm source="contact" title="Nous écrire" />
    </main>
  );
}
