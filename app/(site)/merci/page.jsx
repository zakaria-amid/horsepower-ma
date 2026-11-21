export const metadata = { title: 'Demande envoyée — Horsepower.ma', robots: { index: false } };
export default function Page() {
  return (
    <main className="pub-wrap pub-page">
      <section className="pub-soon">
        <span className="pub-kicker">Demande reçue</span>
        <h1>Merci&#160;!</h1>
        <p>Votre demande est bien enregistrée. Nous vous recontactons rapidement par téléphone ou WhatsApp.</p>
        <div className="pub-actions">
          <a href="/neuf" className="pub-btn red">Continuer à comparer →</a>
          <a href="/" className="pub-btn line">Retour à l'accueil</a>
        </div>
      </section>
    </main>
  );
}
