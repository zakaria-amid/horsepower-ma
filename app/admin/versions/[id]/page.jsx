import { notFound } from 'next/navigation';
import AdminShell, { Flash } from '../../../../components/AdminShell';
import VersionFields from '../../../../components/VersionFields';
import { requireAdmin } from '../../../../lib/session';
import { ensureSchema, q } from '../../../../lib/db';
import { updateVersion } from '../../actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Modifier une version — Admin Horsepower.ma' };

export default async function VersionEditPage({ params, searchParams }) {
  const session = await requireAdmin();
  const { id } = await params;
  const flash = (await searchParams) || {};
  const versionId = Number.parseInt(id, 10);
  if (!Number.isFinite(versionId)) notFound();
  await ensureSchema();

  const [v] = await q(
    `select v.*, m.name as model_name, b.name as brand_name
       from versions v join models m on m.id = v.model_id join brands b on b.id = m.brand_id
      where v.id = $1`,
    [versionId]
  );
  if (!v) notFound();

  return (
    <AdminShell
      active="modeles"
      title={`${v.brand_name} ${v.model_name}`}
      email={session.e}
      actions={
        <a href={`/admin/modeles/${v.model_id}`} className="link-btn">
          ← Retour au modèle
        </a>
      }
    >
      <Flash params={flash} />
      <section className="panel">
        <h2>Modifier la version</h2>
        <form action={updateVersion} className="form-row">
          <input type="hidden" name="id" value={v.id} />
          <input type="hidden" name="model_id" value={v.model_id} />
          <VersionFields v={v} />
          <button className="btn-primary" type="submit">
            Enregistrer
          </button>
        </form>
      </section>
    </AdminShell>
  );
}
