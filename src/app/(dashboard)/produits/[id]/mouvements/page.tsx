import { redirect } from "next/navigation";

import { getUtilisateurConnecte } from "../../../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaMouvementStockRepository } from "../../../../../infrastructure/repositories/PrismaMouvementStockRepository";
import { PrismaProduitRepository } from "../../../../../infrastructure/repositories/PrismaProduitRepository";
import { listerMouvementsProduit } from "../../../../../application/stock/listerMouvementsProduit";
import { enregistrerMouvementAction } from "./actions";
import { MouvementStockForm } from "./MouvementStockForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

const produitRepository = new PrismaProduitRepository();
const mouvementRepository = new PrismaMouvementStockRepository();

function formaterDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function MouvementsProduitPage({ params }: PageProps) {
  const { id: produitId } = await params;
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const produit = await produitRepository.trouverParId(produitId);

  if (!produit || produit.entrepriseId !== utilisateurConnecte.entrepriseId) {
    redirect("/produits");
  }

  const mouvements = await listerMouvementsProduit(mouvementRepository, produitId);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">Vantik</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Mouvement de stock</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Produit: <span className="font-medium text-zinc-900">{produit.nom}</span>. Stock actuel: {produit.quantiteStock}. Seuil d'alerte: {produit.seuilAlerte}.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <MouvementStockForm produitId={produitId} action={enregistrerMouvementAction} />

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-zinc-900">Historique des mouvements</h2>
              <p className="mt-1 text-sm text-zinc-500">{mouvements.length} mouvement(s) enregistré(s).</p>
            </div>

            {mouvements.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-sm text-zinc-500">
                Aucun mouvement pour ce produit pour le moment.
              </p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-zinc-200">
                <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
                  <thead className="bg-zinc-50 text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Quantité</th>
                      <th className="px-4 py-3 font-medium">Motif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 bg-white">
                    {mouvements.map((mouvement) => (
                      <tr key={mouvement.id}>
                        <td className="px-4 py-3 text-zinc-700">{formaterDate(mouvement.date)}</td>
                        <td className="px-4 py-3 text-zinc-900">{mouvement.type}</td>
                        <td className="px-4 py-3 text-zinc-700">{mouvement.quantite}</td>
                        <td className="px-4 py-3 text-zinc-700">{mouvement.motif ?? "—"}</td>
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