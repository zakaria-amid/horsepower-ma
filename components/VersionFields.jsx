import { FUELS, GEARBOXES, STATUSES, PRICE_SOURCES } from '../lib/db';

// Champs communs aux formulaires d'ajout et de modification d'une version.
export default function VersionFields({ v = {}, defaultFuel = '' }) {
  const checked = v.price_checked_at ? new Date(v.price_checked_at).toISOString().slice(0, 10) : '';
  return (
    <>
      <label className="field grow">
        Version
        <input name="name" required maxLength={120} defaultValue={v.name || ''} placeholder="ex. 1.3 TCe 130 Journey EDC" />
      </label>
      <label className="field small">
        Puissance (ch)
        <input name="power_hp" inputMode="numeric" defaultValue={v.power_hp ?? ''} placeholder="130" />
      </label>
      <label className="field">
        Boîte
        <select name="gearbox" defaultValue={v.gearbox || ''}>
          <option value="">—</option>
          {GEARBOXES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Énergie
        <select name="fuel" defaultValue={v.fuel || defaultFuel || ''}>
          <option value="">—</option>
          {FUELS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Prix public (DH)
        <input name="price_mad" inputMode="numeric" defaultValue={v.price_mad ?? ''} placeholder="245000" />
      </label>
      <label className="field">
        Source du prix
        <select name="price_source" defaultValue={v.price_source || 'manuel'}>
          {PRICE_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <label className="field grow">
        Lien de la source
        <input name="price_source_url" maxLength={500} defaultValue={v.price_source_url || ''} placeholder="Page de prix de l'importateur" />
      </label>
      <label className="field">
        Prix vérifié le
        <input type="date" name="price_checked_at" defaultValue={checked} />
      </label>
      <label className="field">
        Statut
        <select name="status" defaultValue={v.status || 'brouillon'}>
          {STATUSES.map((st) => (
            <option key={st} value={st}>
              {st === 'publié' ? 'Publié' : 'Brouillon'}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
