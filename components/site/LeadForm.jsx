// Formulaire « Recevoir une offre » : enregistré dans la table leads (visible dans l'admin).
export default function LeadForm({ model = '', source = 'site', title = 'Recevoir une offre' }) {
  return (
    <section className="pub-lead">
      <div>
        <span className="pub-kicker">{title}</span>
        <h2>Le meilleur prix, sans faire le tour des concessions.</h2>
        <p>Laissez vos coordonnées : nous transmettons votre demande aux concessionnaires officiels.</p>
      </div>
      <form method="post" action="/api/leads" className="pub-lead-form">
        <input type="hidden" name="source" value={source} />
        <label className="pub-hp" aria-hidden="true">
          Ne pas remplir
          <input type="text" name="site_web" tabIndex={-1} autoComplete="off" />
        </label>
        <label>
          Prénom
          <input type="text" name="prenom" required maxLength={60} autoComplete="given-name" />
        </label>
        <label>
          Téléphone / WhatsApp
          <input type="tel" name="telephone" required maxLength={30} autoComplete="tel" inputMode="tel" />
        </label>
        <label>
          Modèle qui vous intéresse
          <input type="text" name="modele" maxLength={120} defaultValue={model} />
        </label>
        <label>
          Ville
          <input type="text" name="ville" maxLength={60} autoComplete="address-level2" />
        </label>
        <button type="submit">Envoyer ma demande →</button>
      </form>
    </section>
  );
}
