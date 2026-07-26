import Link from "next/link";
import { redirect } from "next/navigation";

import { listerCommandes } from "../../../application/commandes/listerCommandes";
import { listerFournisseurs } from "../../../application/fournisseurs/listerFournisseurs";
import { listerProduits } from "../../../application/produits/listerProduits";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaCommandeRepository } from "../../../infrastructure/repositories/PrismaCommandeRepository";
import { PrismaFournisseurRepository } from "../../../infrastructure/repositories/PrismaFournisseurRepository";
import { PrismaProduitRepository } from "../../../infrastructure/repositories/PrismaProduitRepository";
import { ProduitForm } from "../produits/ProduitForm";
import { creerProduitDepuisCommandeAction, creerCommandeAction, validerCommandeAction, annulerCommandeAction, receptionnerCommandeAction } from "./actions";
import { CommandeForm } from "./CommandeForm";

const commandeRepository = new PrismaCommandeRepository();
const fournisseurRepository = new PrismaFournisseurRepository();
const produitRepository = new PrismaProduitRepository();

export default async function CommandesFournisseursPage() {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const [commandes, fournisseurs, produits] = await Promise.all([
    listerCommandes(commandeRepository, utilisateurConnecte.entrepriseId),
    listerFournisseurs(fournisseurRepository, utilisateurConnecte.entrepriseId),
    listerProduits(produitRepository, utilisateurConnecte.entrepriseId),
  ]);

  const fournisseursParId = new Map(fournisseurs.map((fournisseur) => [fournisseur.id, fournisseur.nom]));
  const produitsParId = new Map(produits.map((produit) => [produit.id, produit.nom]));

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">Vantik</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Commandes fournisseurs</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                Création des achats, validation, réception et annulation des commandes fournisseurs.
              </p>
            </div>

            <Link href="/fournisseurs" className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900">
              Voir les fournisseurs
            </Link>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[360px_360px_1fr]">
          <ProduitForm entrepriseId={utilisateurConnecte.entrepriseId} action={creerProduitDepuisCommandeAction} />

          <CommandeForm
            entrepriseId={utilisateurConnecte.entrepriseId}
            utilisateurId={utilisateurConnecte.id}
            fournisseurs={fournisseurs}
            produits={produits}
            action={creerCommandeAction}
          />

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Commandes enregistrées</h2>
                <p className="mt-1 text-sm text-zinc-500">{commandes.length} commande(s) trouvée(s).</p>
              </div>
            </div>

            {commandes.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-sm text-zinc-500">Aucune commande fournisseur pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {commandes.map((commande) => (
                  <article key={commande.id} className="rounded-2xl border border-zinc-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">Fournisseur: {fournisseursParId.get(commande.fournisseurId) ?? commande.fournisseurId}</p>
                        <p className="mt-1 text-xs text-zinc-500">Statut: {commande.statut} - {commande.dateCommande.toLocaleDateString("fr-FR")}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {commande.statut === "BROUILLON" ? (
                          <form action={validerCommandeAction.bind(null, utilisateurConnecte.entrepriseId)}>
                            <input type="hidden" name="commandeJson" value={JSON.stringify(commande)} />
                            <button type="submit" className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700">Valider</button>
                          </form>
                        ) : null}

                        {commande.statut === "VALIDEE" ? (
                          <form action={receptionnerCommandeAction.bind(null, utilisateurConnecte.entrepriseId)}>
                            <input type="hidden" name="commandeJson" value={JSON.stringify(commande)} />
                            <button type="submit" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100">Réceptionner</button>
                          </form>
                        ) : null}

                        {commande.statut === "BROUILLON" || commande.statut === "VALIDEE" ? (
                          <form action={annulerCommandeAction.bind(null, utilisateurConnecte.entrepriseId)}>
                            <input type="hidden" name="commandeJson" value={JSON.stringify(commande)} />
                            <button type="submit" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100">Annuler</button>
                          </form>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200">
                      <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
                        <thead className="bg-zinc-50 text-zinc-500">
                          <tr>
                            <th className="px-3 py-2 font-medium">Produit</th>
                            <th className="px-3 py-2 font-medium">Quantité</th>
                            <th className="px-3 py-2 font-medium">Prix appliqué</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 bg-white">
                          {commande.lignes.map((ligne) => (
                            <tr key={ligne.id}>
                              <td className="px-3 py-2 text-zinc-700">{produitsParId.get(ligne.produitId) ?? ligne.produitId}</td>
                              <td className="px-3 py-2 text-zinc-700">{ligne.quantite}</td>
                              <td className="px-3 py-2 text-zinc-700">{ligne.prixApplique.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}