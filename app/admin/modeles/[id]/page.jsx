import { notFound } from 'next/navigation';
import AdminShell, { Flash, formatPrice, pricePerHp } from '../../../../components/AdminShell';
import VersionFields from '../../../../components/VersionFields';
import PhotoUploader from '../../../../components/PhotoUploader';
import { requireAdmin } from '../../../../lib/session';
import { ensureSchema, q, BODY_TYPES, FUELS, STATUSES } from '../../../../lib/db';
import { updateModel, createVersion, deleteVersion, deletePhoto, setCoverPhoto } from '../../actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Modèle — Admin Horsepower.ma' };

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
}

export default async function ModelPage({ params, searchParams }) {
  const session = await requireAdmin();
  const { id } = await params;
  const flash = (await searchParams) || {};
  const modelId = Number.parseInt(id, 10);
  if (!Number.isFinite(modelId)) notFound();
  await ensureSchema();

  const [model] = await q('select m.*, b.name as brand_name from models m join brands b on b.id = m.brand_id where m.id = $1', [modelId]);
  if (!model) notFound();
  const brands = await q('select id, name from brands order by name');
  const versions = await q('select * from versions where model_id = $1 order by price_mad nulls last, name', [modelId]);
  const photos = await q('select * from photos where model_id = $1 order by position, id', [modelId]);
  const totalKb = Math.round(photos.reduce((sum, p) => sum + (p.bytes || 0) + (p.thumb_bytes || 0), 0) / 1024);

  return (
    <AdminShell
      active="modeles"
      title={`${model.brand_name} ${model.name}`}
      email={session.e}
      actions={
        <a href={`/admin/modeles?marque=${model.brand_id}`} className="link-btn">
          ← Modèles {model.brand_name}
        </a>
      }
    >
      <Flash params={flash} />

      <section className="panel">
        <h2>Fiche du modèle</h2>
        <form action={updateModel} className="form-row">
          <input type="hidden" name="id" value={model.id} />
          <label className="field">
            Marque
            <select name="brand_id" required defaultValue={String(model.brand_id)}>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field grow">
            Nom du modèle
            <input name="name" required maxLength={80} defaultValue={model.name} />
          </label>
          <label className="field">
            Carrosserie
            <select name="body_type" defaultValue={model.body_type || ''}>
              <option value="">—</option>
              {BODY_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Énergie
            <select name="fuel" defaultValue={model.fuel || ''}>
              <option value="">—</option>
              {FUELS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Statut
            <select name="status" defaultValue={model.status}>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === 'publié' ? 'Publié' : 'Brouillon'}
                </option>
              ))}
            </select>
          </label>
          <button className="btn-primary" type="submit">
            Enregistrer
          </button>
        </form>
      </section>


      <section className="panel">
        <div className="panel-head">
          <h2>
            {photos.length} photo{photos.length > 1 ? 's' : ''}
          </h2>
          {photos.length > 0 && <span className="hint-text">{totalKb.toLocaleString('fr-FR')} Ko au total, miniatures comprises</span>}
        </div>
        {photos.length > 0 && (
          <div className="photo-grid">
            {photos.map((p, i) => (
              <figure key={p.id} className={i === 0 ? 'photo cover' : 'photo'}>
                <img src={p.thumb_url} alt={p.alt || `${model.brand_name} ${model.name}`} width={p.width ? 640 : undefined} loading="lazy" decoding="async" />
                <figcaption>
                  <span>
                    {i === 0 ? 'Photo principale · ' : ''}
                    {p.width}×{p.height} · {Math.round((p.bytes || 0) / 1024)} Ko
                  </span>
                  {p.credit && <span className="credit">{p.credit}</span>}
                  <span className="photo-actions">
                    {i !== 0 && (
                      <form action={setCoverPhoto}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="model_id" value={model.id} />
                        <button type="submit" className="link-btn">Mettre en principale</button>
                      </form>
                    )}
                    <details className="confirm">
                      <summary className="link-btn danger">Supprimer</summary>
                      <form action={deletePhoto}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="model_id" value={model.id} />
                        <button type="submit" className="btn-danger">Oui, supprimer</button>
                      </form>
                    </details>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
        <PhotoUploader modelId={model.id} slug={model.slug} altBase={`${model.brand_name} ${model.name}`} brandName={model.brand_name} />
        <p className="hint-text">
          Photos des espaces presse : gardez le crédit de la marque, il sera affiché sous la photo sur le site.
        </p>
      </section>

      <section className="panel">
        <h2>
          {versions.length} version{versions.length > 1 ? 's' : ''} et prix
        </h2>
        {versions.length === 0 ? (
          <p className="empty">Aucune version. Ajoutez la première ci-dessous avec son prix public au Maroc.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Puissance</th>
                  <th>Boîte</th>
                  <th>Énergie</th>
                  <th>Prix</th>
                  <th>DH / ch</th>
                  <th>Source</th>
                  <th>Vérifié le</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v) => (
                  <tr key={v.id}>
                    <td className="strong">{v.name}</td>
                    <td>{v.power_hp ? `${v.power_hp} ch` : '—'}</td>
                    <td>{v.gearbox || '—'}</td>
                    <td>{v.fuel || '—'}</td>
                    <td className="strong">{formatPrice(v.price_mad)}</td>
                    <td>{pricePerHp(v.price_mad, v.power_hp)}</td>
                    <td>
                      {v.price_source_url ? (
                        <a href={v.price_source_url} target="_blank" rel="noopener" className="muted-link">
                          {v.price_source}
                        </a>
                      ) : (
                        v.price_source
                      )}
                    </td>
                    <td>{formatDate(v.price_checked_at)}</td>
                    <td>
                      <span className={v.status === 'publié' ? 'pill ok' : 'pill'}>{v.status === 'publié' ? 'Publié' : 'Brouillon'}</span>
                    </td>
                    <td className="row-actions">
                      <a href={`/admin/versions/${v.id}`} className="link-btn">
                        Modifier
                      </a>
                      <details className="confirm">
                        <summary className="link-btn danger">Supprimer</summary>
                        <form action={deleteVersion}>
                          <input type="hidden" name="id" value={v.id} />
                          <input type="hidden" name="model_id" value={model.id} />
                          <button type="submit" className="btn-danger">
                            Oui, supprimer
                          </button>
                        </form>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Ajouter une version</h2>
        <form action={createVersion} className="form-row">
          <input type="hidden" name="model_id" value={model.id} />
          <VersionFields defaultFuel={model.fuel || ''} />
          <button className="btn-primary" type="submit">
            Ajouter la version
          </button>
        </form>
      </section>
    </AdminShell>
  );
}
