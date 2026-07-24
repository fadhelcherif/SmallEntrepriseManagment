import { creerProduitAction } from "./actions";
import { ProduitActions } from "./ProduitActions";
import { ProduitForm } from "./ProduitForm";
import { logoutAction } from "../../(auth)/logout/actions";
import { listerProduits } from "../../../application/produits/listerProduits";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaProduitRepository } from "../../../infrastructure/repositories/PrismaProduitRepository";
import { redirect } from "next/navigation";

const repository = new PrismaProduitRepository();

export default async function ProduitsPage() {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const produits = await listerProduits(repository, utilisateurConnecte.entrepriseId);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">Vantik</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Produits</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                Gestion du catalogue produits de l’entreprise. La page liste les produits existants et permet d’en créer un nouveau.
              </p>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <ProduitForm entrepriseId={utilisateurConnecte.entrepriseId} action={creerProduitAction} />

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Produits enregistrés</h2>
                <p className="mt-1 text-sm text-zinc-500">{produits.length} produit(s) trouvé(s).</p>
              </div>
            </div>

            {produits.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-sm text-zinc-500">
                Aucun produit pour cette entreprise pour le moment.
              </p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-zinc-200">
                <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
                  <thead className="bg-zinc-50 text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nom</th>
                      <th className="px-4 py-3 font-medium">Prix unitaire</th>
                      <th className="px-4 py-3 font-medium">Stock</th>
                      <th className="px-4 py-3 font-medium">Seuil</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 bg-white">
                    {produits.map((produit) => (
                      <tr key={produit.id} className="align-top">
                        <td className="px-4 py-3">
                          <div className="font-medium text-zinc-900">{produit.nom}</div>
                          {produit.description ? (
                            <div className="mt-1 text-xs text-zinc-500">{produit.description}</div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-zinc-700">{produit.prixUnitaire.toFixed(2)}</td>
                        <td className="px-4 py-3 text-zinc-700">{produit.quantiteStock}</td>
                        <td className="px-4 py-3 text-zinc-700">{produit.seuilAlerte}</td>
                        <td className="px-4 py-3 align-top">
                          <ProduitActions entrepriseId={utilisateurConnecte.entrepriseId} produit={produit} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}