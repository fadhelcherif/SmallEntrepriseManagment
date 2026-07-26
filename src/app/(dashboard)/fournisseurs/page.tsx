import { redirect } from "next/navigation";

import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaFournisseurRepository } from "../../../infrastructure/repositories/PrismaFournisseurRepository";
import { listerFournisseurs } from "../../../application/fournisseurs/listerFournisseurs";
import Link from "next/link";
import { FournisseursForm } from "./FournisseursForm";
import { creerFournisseurAction, modifierFournisseurAction, supprimerFournisseurAction } from "./actions";

const repository = new PrismaFournisseurRepository();

function formaterValeurEntree(nombre?: number | null): string {
  return nombre === undefined || nombre === null ? "" : String(nombre);
}

function FournisseurActions({ entrepriseId, fournisseur }: { entrepriseId: string; fournisseur: { id: string; nom: string; contact?: string | null; adresse?: string | null; delaiLivraisonJours?: number | null; } }) {
  return (
    <div className="flex flex-col gap-3">
      <details className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
        <summary className="cursor-pointer list-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-center text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900">Modifier</summary>

        <form action={modifierFournisseurAction.bind(null, entrepriseId, fournisseur.id)} className="mt-3 grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Nom</span>
            <input name="nom" type="text" required defaultValue={fournisseur.nom} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Contact</span>
            <input name="contact" type="text" defaultValue={fournisseur.contact ?? ""} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Adresse</span>
            <input name="adresse" type="text" defaultValue={fournisseur.adresse ?? ""} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Délai de livraison (jours)</span>
            <input name="delaiLivraisonJours" type="number" min="0" step="1" defaultValue={formaterValeurEntree(fournisseur.delaiLivraisonJours)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900" />
          </label>
          <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700">Enregistrer</button>
        </form>
      </details>

      <form action={supprimerFournisseurAction.bind(null, entrepriseId, fournisseur.id)}>
        <button type="submit" className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100">
          Supprimer
        </button>
      </form>
    </div>
  );
}

export default async function FournisseursPage() {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const fournisseurs = await listerFournisseurs(repository, utilisateurConnecte.entrepriseId);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">Vantik</p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Fournisseurs</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">Gestion des fournisseurs liés à l'entreprise connectée.</p>
            </div>
            <Link href="/produits" className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900">Retour aux produits</Link>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <FournisseursForm entrepriseId={utilisateurConnecte.entrepriseId} action={creerFournisseurAction} />

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Fournisseurs enregistrés</h2>
                <p className="mt-1 text-sm text-zinc-500">{fournisseurs.length} fournisseur(s) trouvé(s).</p>
              </div>
            </div>

            {fournisseurs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-sm text-zinc-500">Aucun fournisseur pour cette entreprise pour le moment.</p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-zinc-200">
                <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
                  <thead className="bg-zinc-50 text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nom</th>
                      <th className="px-4 py-3 font-medium">Contact</th>
                      <th className="px-4 py-3 font-medium">Adresse</th>
                      <th className="px-4 py-3 font-medium">Délai</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 bg-white">
                    {fournisseurs.map((fournisseur) => (
                      <tr key={fournisseur.id} className="align-top">
                        <td className="px-4 py-3 font-medium text-zinc-900">{fournisseur.nom}</td>
                        <td className="px-4 py-3 text-zinc-700">{fournisseur.contact ?? "-"}</td>
                        <td className="px-4 py-3 text-zinc-700">{fournisseur.adresse ?? "-"}</td>
                        <td className="px-4 py-3 text-zinc-700">{fournisseur.delaiLivraisonJours ?? "-"}</td>
                        <td className="px-4 py-3 align-top"><FournisseurActions entrepriseId={utilisateurConnecte.entrepriseId} fournisseur={fournisseur} /></td>
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