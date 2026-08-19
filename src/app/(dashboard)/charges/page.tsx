import { redirect } from "next/navigation";
import { ReceiptText } from "lucide-react";

import { genererChargesRecurrentesManquantes } from "../../../application/charges/genererChargesRecurrentesManquantes";
import { TYPE_CHARGE_ACHAT_FOURNISSEUR, TYPE_CHARGE_SALAIRE } from "../../../domain/entities/Charge";
import { listerFournisseurs } from "../../../application/fournisseurs/listerFournisseurs";
import { listerUtilisateurs } from "../../../application/utilisateurs/listerUtilisateurs";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaChargeRepository } from "../../../infrastructure/repositories/PrismaChargeRepository";
import { PrismaFournisseurRepository } from "../../../infrastructure/repositories/PrismaFournisseurRepository";
import { PrismaUtilisateurRepository } from "../../../infrastructure/repositories/PrismaUtilisateurRepository";
import { creerChargeAction } from "./actions";
import { ChargeForm } from "./ChargeForm";
import { ChargeActions } from "./ChargeActions";
import { PageHeader } from "../../_components/ui/PageHeader";
import { Panel } from "../../_components/ui/Panel";
import { EmptyState } from "../../_components/ui/EmptyState";
import { Badge } from "../../_components/ui/Badge";

const chargeRepository = new PrismaChargeRepository();
const fournisseurRepository = new PrismaFournisseurRepository();
const utilisateurRepository = new PrismaUtilisateurRepository();

export default async function ChargesPage() {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  if (utilisateurConnecte.role !== "ADMINISTRATEUR") {
    redirect("/produits");
  }

  const [charges, fournisseurs, utilisateurs] = await Promise.all([
    genererChargesRecurrentesManquantes(chargeRepository, utilisateurConnecte.entrepriseId),
    listerFournisseurs(fournisseurRepository, utilisateurConnecte.entrepriseId),
    listerUtilisateurs(utilisateurRepository, utilisateurConnecte.entrepriseId),
  ]);

  const fournisseursParId = new Map(fournisseurs.map((fournisseur) => [fournisseur.id, fournisseur.nom]));
  const utilisateursParId = new Map(utilisateurs.map((utilisateur) => [utilisateur.id, utilisateur.nom]));

  const maintenant = new Date();
  const chargesMoisCourant = charges.filter(
    (charge) =>
      charge.dateEcheance.getFullYear() === maintenant.getFullYear() &&
      charge.dateEcheance.getMonth() === maintenant.getMonth(),
  );
  const totalMoisCourant = chargesMoisCourant.reduce((total, charge) => total + charge.montant, 0);

  const chargesTriees = [...charges].sort((a, b) => b.dateEcheance.getTime() - a.dateEcheance.getTime());

  const typesReserves = new Set([TYPE_CHARGE_SALAIRE.toLowerCase(), TYPE_CHARGE_ACHAT_FOURNISSEUR.toLowerCase()]);
  const typesExistants = [...new Set(charges.map((charge) => charge.type))].filter(
    (type) => !typesReserves.has(type.toLowerCase()),
  );

  return (
    <main className="px-5 py-6 sm:px-8">
      <div className="flex w-full flex-col gap-6">
        <PageHeader
          title="Charges"
          description="Loyer, factures, emballage, salaires et autres charges de l'entreprise. Réservé aux administrateurs."
        />

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <ChargeForm typesExistants={typesExistants} action={creerChargeAction} />

          <Panel
            title="Charges enregistrées"
            description={`${charges.length} charge(s) — total du mois en cours : ${totalMoisCourant.toFixed(2)}`}
          >
            {charges.length === 0 ? (
              <EmptyState
                icon={ReceiptText}
                title="Aucune charge pour le moment"
                description="Ajoute ta première charge avec le formulaire à gauche."
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-stone-200">
                <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                  <thead className="bg-stone-50 text-stone-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Lié à</th>
                      <th className="px-4 py-3 text-right font-medium">Montant</th>
                      <th className="px-4 py-3 font-medium">Échéance</th>
                      <th className="px-4 py-3 font-medium">Récurrente</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {chargesTriees.map((charge) => {
                      const lieA = charge.utilisateurId
                        ? utilisateursParId.get(charge.utilisateurId)
                        : charge.fournisseurId
                          ? fournisseursParId.get(charge.fournisseurId)
                          : undefined;

                      return (
                        <tr key={charge.id}>
                          <td className="px-4 py-3 font-medium text-stone-900">{charge.type}</td>
                          <td className="px-4 py-3 text-stone-700">{lieA ?? "—"}</td>
                          <td className="px-4 py-3 text-right text-stone-700">{charge.montant.toFixed(2)}</td>
                          <td className="px-4 py-3 text-stone-700">{charge.dateEcheance.toLocaleDateString("fr-FR")}</td>
                          <td className="px-4 py-3">
                            {charge.recurrente ? <Badge variante="info">Récurrente</Badge> : <Badge variante="neutre">Ponctuelle</Badge>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <ChargeActions chargeId={charge.id} libelle={charge.type} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}
