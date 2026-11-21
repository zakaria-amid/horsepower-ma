import { notFound } from 'next/navigation';
import AdminShell, { Flash } from '../../../../components/AdminShell';
import { requireAdmin } from '../../../../lib/session';
import { ensureSchema, q } from '../../../../lib/db';
import { updateBrand } from '../../actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Modifier une marque — Admin Horsepower.ma' };

export default async function BrandEditPage({ params, searchParams }) {
  const session = await requireAdmin();
  const { id } = await params;
  const flash = (await searchParams) || {};
  const brandId = Number.parseInt(id, 10);
  if (!Number.isFinite(brandId)) notFound();
  await ensureSchema();
  const [brand] = await q('select * from brands where id = $1', [brandId]);
  if (!brand) notFound();

  return (
    <AdminShell
      active="marques"
      title={brand.name}
      email={session.e}
      actions={
        <a href="/admin/marques" className="link-btn">
          ← Toutes les marques
        </a>
      }
    >
      <Flash params={flash} />
      <section className="panel narrow">
        <h2>Modifier la marque</h2>
        <form action={updateBrand} className="form-stack">
          <input type="hidden" name="id" value={brand.id} />
          <label className="field">
            Nom
            <input name="name" required maxLength={80} defaultValue={brand.name} />
          </label>
          <label className="field">
            Pays d'origine
            <input name="country" maxLength={60} defaultValue={brand.country || ''} />
          </label>
          <label className="field">
            Site officiel au Maroc
            <input name="website" maxLength={500} defaultValue={brand.website || ''} />
          </label>
          <label className="check">
            <input type="checkbox" name="active" defaultChecked={brand.active} />
            Marque visible sur le site
          </label>
          <div className="form-actions">
            <button className="btn-primary" type="submit">
              Enregistrer
            </button>
            <a href={`/admin/modeles?marque=${brand.id}`} className="link-btn">
              Voir ses modèles →
            </a>
          </div>
        </form>
      </section>
    </AdminShell>
  );
}
