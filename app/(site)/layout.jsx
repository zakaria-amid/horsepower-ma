import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';

export default function SiteLayout({ children }) {
  return (
    <div className="pub">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
