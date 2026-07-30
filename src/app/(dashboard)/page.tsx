import { redirect } from "next/navigation";
import { Building2, Compass, Package, BellRing } from "lucide-react";

import { listerAlertes } from "../../application/alertes/listerAlertes";
import { listerProduits } from "../../application/produits/listerProduits";
import { getUtilisateurConnecte } from "../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaEntrepriseRepository } from "../../infrastructure/repositories/PrismaEntrepriseRepository";
import { PrismaAlerteRepository } from "../../infrastructure/repositories/PrismaAlerteRepository";
import { PrismaProduitRepository } from "../../infrastructure/repositories/PrismaProduitRepository";
import { PageHeader } from "../_components/ui/PageHeader";
import { StatCard } from "../_components/ui/StatCard";

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
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <PageHeader
          eyebrow="Accueil"
          title={`Bienvenue, ${utilisateurConnecte.nom}`}
          description="Voici un aperçu rapide de l'entreprise connectée."
        />

        <section className="grid gap-4 sm:grid-cols-2">
          <StatCard icon={Building2} label="Entreprise" value={entreprise.nom} hint="Entreprise connectée" />
          <StatCard icon={Package} label="Produits total" value={produits.length} hint="Produits enregistrés au catalogue" />
          <StatCard icon={BellRing} label="Alertes non lues" value={alertesNonLues.length} hint="Alertes à traiter" />
          <StatCard
            icon={Compass}
            label="Navigation"
            value="Menu latéral"
            hint="Accède aux produits, alertes et paramètres depuis la barre latérale."
          />
        </section>
      </div>
    </main>
  );
}
