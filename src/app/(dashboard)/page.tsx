import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BellRing, ClipboardList, Package, Receipt, Truck } from "lucide-react";

import { listerAlertes } from "../../application/alertes/listerAlertes";
import { listerCommandes } from "../../application/commandes/listerCommandes";
import { listerFournisseurs } from "../../application/fournisseurs/listerFournisseurs";
import { listerProduits } from "../../application/produits/listerProduits";
import { getUtilisateurConnecte } from "../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaAlerteRepository } from "../../infrastructure/repositories/PrismaAlerteRepository";
import { PrismaCommandeRepository } from "../../infrastructure/repositories/PrismaCommandeRepository";
import { PrismaEntrepriseRepository } from "../../infrastructure/repositories/PrismaEntrepriseRepository";
import { PrismaFournisseurRepository } from "../../infrastructure/repositories/PrismaFournisseurRepository";
import { PrismaProduitRepository } from "../../infrastructure/repositories/PrismaProduitRepository";
import { Panel } from "../_components/ui/Panel";
import { PageHeader } from "../_components/ui/PageHeader";
import { StatCard } from "../_components/ui/StatCard";
import { EmptyState } from "../_components/ui/EmptyState";

const produitRepository = new PrismaProduitRepository();
const alerteRepository = new PrismaAlerteRepository();
const entrepriseRepository = new PrismaEntrepriseRepository();
const fournisseurRepository = new PrismaFournisseurRepository();
const commandeRepository = new PrismaCommandeRepository();

const RACCOURCIS = [
  { href: "/produits", label: "Produits", icon: Package },
  { href: "/fournisseurs", label: "Fournisseurs", icon: Truck },
  { href: "/commandes-fournisseurs", label: "Commandes fournisseurs", icon: ClipboardList },
  { href: "/commandes-clients", label: "Commandes clients", icon: Receipt },
  { href: "/alertes", label: "Alertes", icon: BellRing },
];

function formaterDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AccueilDashboardPage() {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const [entreprise, produits, alertes, fournisseurs, commandes] = await Promise.all([
    entrepriseRepository.trouverParId(utilisateurConnecte.entrepriseId),
    listerProduits(produitRepository, utilisateurConnecte.entrepriseId),
    listerAlertes(alerteRepository, utilisateurConnecte.entrepriseId),
    listerFournisseurs(fournisseurRepository, utilisateurConnecte.entrepriseId),
    listerCommandes(commandeRepository, utilisateurConnecte.entrepriseId),
  ]);

  if (!entreprise) {
    redirect("/login");
  }

  const commandesEnCours = commandes.filter(
    (commande) => commande.statut === "BROUILLON" || commande.statut === "VALIDEE",
  ).length;
  const alertesRecentes = alertes.slice(0, 3);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <PageHeader
          eyebrow="Accueil"
          title={`Bienvenue, ${utilisateurConnecte.nom}`}
          description={`${entreprise.nom} — ${entreprise.typeMetier}`}
          actions={
            entreprise.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entreprise.logo}
                alt={entreprise.nom}
                className="h-11 w-11 shrink-0 rounded-md border border-stone-200 bg-white object-contain p-1"
              />
            ) : undefined
          }
        />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Package} label="Produits" value={produits.length} hint="Références au catalogue" />
          <StatCard icon={Truck} label="Fournisseurs" value={fournisseurs.length} hint="Partenaires actifs" />
          <StatCard icon={ClipboardList} label="Commandes en cours" value={commandesEnCours} hint="Brouillons et validées" />
          <StatCard icon={BellRing} label="Alertes non lues" value={alertes.length} hint="À traiter" />
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {RACCOURCIS.map((raccourci) => {
            const Icon = raccourci.icon;

            return (
              <Link
                key={raccourci.href}
                href={raccourci.href}
                className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white p-4 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-900 hover:text-stone-900"
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {raccourci.label}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-stone-300" strokeWidth={1.75} />
              </Link>
            );
          })}
        </section>

        <Panel
          title="Alertes récentes"
          description={`${alertes.length} alerte(s) non lue(s) au total.`}
          actions={
            <Link href="/alertes" className="text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-4 hover:text-stone-900">
              Voir toutes les alertes
            </Link>
          }
        >
          {alertesRecentes.length === 0 ? (
            <EmptyState
              icon={BellRing}
              title="Aucune alerte non lue"
              description="Tout est sous contrôle : les alertes de stock ou d'expiration apparaîtront ici."
            />
          ) : (
            <div className="grid gap-3">
              {alertesRecentes.map((alerte) => (
                <article key={alerte.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <p className="text-sm font-semibold text-stone-900">{alerte.type}</p>
                  <p className="mt-1 text-sm text-stone-700">{alerte.message}</p>
                  <p className="mt-2 text-xs text-stone-500">{formaterDate(alerte.dateGeneration)}</p>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </main>
  );
}
