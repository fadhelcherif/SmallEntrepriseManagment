import { redirect } from "next/navigation";

import { listerAlertes } from "../../application/alertes/listerAlertes";
import { listerProduits } from "../../application/produits/listerProduits";
import { getUtilisateurConnecte } from "../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaEntrepriseRepository } from "../../infrastructure/repositories/PrismaEntrepriseRepository";
import { PrismaAlerteRepository } from "../../infrastructure/repositories/PrismaAlerteRepository";
import { PrismaProduitRepository } from "../../infrastructure/repositories/PrismaProduitRepository";

const produitRepository = new PrismaProduitRepository();
const alerteRepository = new PrismaAlerteRepository();
const entrepriseRepository = new PrismaEntrepriseRepository();

export default async function AccueilDashboardPage() {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const [entreprise, produits, alertesNonLues] = await Promise.all([
    entrepriseRepository.trouverParId(utilisateurConnecte.entrepriseId),
    listerProduits(produitRepository, utilisateurConnecte.entrepriseId),
    listerAlertes(alerteRepository, utilisateurConnecte.entrepriseId),
  ]);

  if (!entreprise) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">Accueil</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Bienvenue, {utilisateurConnecte.nom}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Voici un aperçu rapide de l'entreprise connectée.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Entreprise</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">{entreprise.nom}</p>
            <p className="mt-1 text-sm text-zinc-600">Entreprise connectée</p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Produits total</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">{produits.length}</p>
            <p className="mt-1 text-sm text-zinc-600">Produits enregistrés au catalogue</p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Alertes non lues</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">{alertesNonLues.length}</p>
            <p className="mt-1 text-sm text-zinc-600">Alertes à traiter</p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Navigation</p>
            <p className="mt-2 text-sm text-zinc-600">
              Utilise le menu latéral pour accéder aux produits, alertes et paramètres.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}