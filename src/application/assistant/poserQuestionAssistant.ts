import type { AlerteRepository } from "../../domain/repositories/AlerteRepository";
import type { ChargeRepository } from "../../domain/repositories/ChargeRepository";
import type { CommandeRepository } from "../../domain/repositories/CommandeRepository";
import type { FournisseurRepository } from "../../domain/repositories/FournisseurRepository";
import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";
import type { UtilisateurRepository } from "../../domain/repositories/UtilisateurRepository";
import type { AttributPersonnaliseRepository } from "../../domain/repositories/AttributPersonnaliseRepository";
import type { ValeurAttributRepository } from "../../domain/repositories/ValeurAttributRepository";
import type { MouvementStockRepository } from "../../domain/repositories/MouvementStockRepository";
import type { MessageAssistantRepository } from "../../domain/repositories/MessageAssistantRepository";
import type { SessionAssistantRepository } from "../../domain/repositories/SessionAssistantRepository";
import type { Charge } from "../../domain/entities/Charge";
import type { MessageAssistant } from "../../domain/entities/MessageAssistant";
import type { SessionAssistant } from "../../domain/entities/SessionAssistant";
import { ENTITE_CIBLE_PRODUIT } from "../../domain/entities/AttributPersonnalise";
import type { AssistantIA, TourConversation } from "../../domain/services/AssistantIA";
import { calculerMontantTotalCommande } from "../../domain/services/calculerMontantCommande";
import { calculerValeurStock } from "../../domain/services/calculerValeurStock";
import { calculerVentesParProduit } from "../../domain/services/calculerVentesParProduit";
import { genererTitreSession } from "../../domain/services/genererTitreSession";
import { formaterAttributsProduit, grouperValeursParProduit } from "../../domain/services/formaterAttributsProduit";
import {
  construireCatalogue,
  construireContexteAssistant,
  type AjustementStock,
  type FicheChargeParType,
  type FicheFournisseur,
  type MembreEquipe,
  type MoisChargeTendance,
  type MoisTendance,
  type ProduitFourni,
} from "../../domain/services/construireContexteAssistant";
import { listerAlertes } from "../alertes/listerAlertes";
import { listerCommandes } from "../commandes/listerCommandes";
import { listerCharges } from "../charges/listerCharges";
import { listerFournisseurs } from "../fournisseurs/listerFournisseurs";
import { listerProduits } from "../produits/listerProduits";
import { listerUtilisateurs } from "../utilisateurs/listerUtilisateurs";
import { listerAttributs } from "../attributs/listerAttributs";
import { listerValeursPourProduits } from "../attributs/listerValeursPourProduits";
import { listerMouvementsEntreprise } from "../stock/listerMouvementsEntreprise";
import { chargerSessionAssistant } from "./chargerSessionAssistant";
import type { Commande } from "../../domain/entities/Commande";

const NOMBRE_MESSAGES_HISTORIQUE = 20;

function debutDuMois(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function finDuMois(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function libelleMois(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(date);
}

function moisEcoules(depuis: Date, maintenant: Date): number {
  return (maintenant.getFullYear() - depuis.getFullYear()) * 12 + (maintenant.getMonth() - depuis.getMonth()) + 1;
}

function calculerTendanceMensuelle(commandes: Commande[], maintenant: Date, nombreMois: number): MoisTendance[] {
  const mois: MoisTendance[] = [];

  for (let decalage = nombreMois - 1; decalage >= 0; decalage--) {
    const reference = new Date(maintenant.getFullYear(), maintenant.getMonth() - decalage, 1);
    const borneDebut = debutDuMois(reference);
    const borneFin = finDuMois(reference);

    const commandesDuMois = commandes.filter(
      (commande) => commande.dateCommande >= borneDebut && commande.dateCommande <= borneFin,
    );
    const ventes = commandesDuMois.filter((commande) => commande.type === "VENTE_CLIENT" && commande.statut === "RECUE");
    const achats = commandesDuMois.filter((commande) => commande.type === "ACHAT_FOURNISSEUR" && commande.statut === "RECUE");

    mois.push({
      libelle: libelleMois(reference),
      montantVentes: calculerMontantTotalCommande(ventes.flatMap((commande) => commande.lignes)),
      montantAchats: calculerMontantTotalCommande(achats.flatMap((commande) => commande.lignes)),
    });
  }

  return mois;
}

function calculerTendanceChargesMensuelle(charges: Charge[], maintenant: Date, nombreMois: number): MoisChargeTendance[] {
  const mois: MoisChargeTendance[] = [];

  for (let decalage = nombreMois - 1; decalage >= 0; decalage--) {
    const reference = new Date(maintenant.getFullYear(), maintenant.getMonth() - decalage, 1);
    const borneDebut = debutDuMois(reference);
    const borneFin = finDuMois(reference);

    const chargesDuMois = charges.filter((charge) => charge.dateEcheance >= borneDebut && charge.dateEcheance <= borneFin);

    mois.push({
      libelle: libelleMois(reference),
      montant: chargesDuMois.reduce((total, charge) => total + charge.montant, 0),
    });
  }

  return mois;
}

export async function poserQuestionAssistant(
  produitRepository: ProduitRepository,
  alerteRepository: AlerteRepository,
  commandeRepository: CommandeRepository,
  chargeRepository: ChargeRepository,
  fournisseurRepository: FournisseurRepository,
  utilisateurRepository: UtilisateurRepository,
  attributRepository: AttributPersonnaliseRepository,
  valeurAttributRepository: ValeurAttributRepository,
  mouvementRepository: MouvementStockRepository,
  sessionAssistantRepository: SessionAssistantRepository,
  messageAssistantRepository: MessageAssistantRepository,
  assistantIA: AssistantIA,
  entrepriseId: string,
  entrepriseNom: string,
  utilisateurId: string,
  estAdministrateur: boolean,
  question: string,
  sessionId: string | null,
): Promise<{ session: SessionAssistant; reponse: string }> {
  let session: SessionAssistant;
  let messagesAnterieurs: MessageAssistant[] = [];

  if (sessionId) {
    const sessionChargee = await chargerSessionAssistant(
      sessionAssistantRepository,
      messageAssistantRepository,
      entrepriseId,
      utilisateurId,
      sessionId,
    );
    session = sessionChargee.session;
    messagesAnterieurs = sessionChargee.messages;
  } else {
    session = await sessionAssistantRepository.creer({ titre: genererTitreSession(question) }, entrepriseId, utilisateurId);
  }

  const historique: TourConversation[] = messagesAnterieurs
    .slice(-NOMBRE_MESSAGES_HISTORIQUE)
    .map((message) => ({ role: message.role, contenu: message.contenu }));

  const [produits, alertes, commandes, fournisseurs, attributsProduit, mouvements] = await Promise.all([
    listerProduits(produitRepository, entrepriseId),
    listerAlertes(alerteRepository, entrepriseId),
    listerCommandes(commandeRepository, entrepriseId),
    listerFournisseurs(fournisseurRepository, entrepriseId),
    listerAttributs(attributRepository, entrepriseId, ENTITE_CIBLE_PRODUIT),
    listerMouvementsEntreprise(mouvementRepository, entrepriseId),
  ]);

  const valeursAttributsParProduit = grouperValeursParProduit(
    await listerValeursPourProduits(valeurAttributRepository, produits.map((produit) => produit.id)),
  );
  const attributsAffichageParProduit = new Map(
    produits.map((produit) => [
      produit.id,
      formaterAttributsProduit(attributsProduit, valeursAttributsParProduit.get(produit.id)),
    ]),
  );

  const maintenant = new Date();
  const borneDebut = debutDuMois(maintenant);
  const borneFin = finDuMois(maintenant);

  const commandesDuMois = commandes.filter(
    (commande) => commande.dateCommande >= borneDebut && commande.dateCommande <= borneFin,
  );
  const ventesRecuesDuMois = commandesDuMois.filter((commande) => commande.type === "VENTE_CLIENT" && commande.statut === "RECUE");
  const achatsRecusDuMois = commandesDuMois.filter((commande) => commande.type === "ACHAT_FOURNISSEUR" && commande.statut === "RECUE");

  const montantVentesDuMois = calculerMontantTotalCommande(ventesRecuesDuMois.flatMap((commande) => commande.lignes));
  const montantAchatsDuMois = calculerMontantTotalCommande(achatsRecusDuMois.flatMap((commande) => commande.lignes));
  const valeurStock = calculerValeurStock(produits);
  const topProduitsVendus = calculerVentesParProduit(ventesRecuesDuMois.flatMap((commande) => commande.lignes)).slice(0, 5);

  const commandesEnCours = commandes.filter((commande) => commande.statut === "BROUILLON" || commande.statut === "VALIDEE").length;
  const commandesAnnulees = commandes.filter((commande) => commande.statut === "ANNULEE").length;
  const tauxAnnulationCommandes = commandes.length > 0 ? (commandesAnnulees / commandes.length) * 100 : 0;

  const ventesRecuesToutes = commandes.filter((commande) => commande.type === "VENTE_CLIENT" && commande.statut === "RECUE");
  const ventesParProduitToutes = new Map(
    calculerVentesParProduit(ventesRecuesToutes.flatMap((commande) => commande.lignes)).map((vendu) => [
      vendu.produitId,
      vendu,
    ]),
  );

  const nomsProduits = new Map(
    produits.map((produit) => {
      const attributsAffichage = attributsAffichageParProduit.get(produit.id) ?? "";
      return [produit.id, attributsAffichage ? `${produit.nom} (${attributsAffichage})` : produit.nom];
    }),
  );

  const ajustementsStock: AjustementStock[] = mouvements
    .filter((mouvement) => mouvement.type === "AJUSTEMENT")
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10)
    .map((mouvement) => ({
      produitNom: nomsProduits.get(mouvement.produitId) ?? mouvement.produitId,
      nouveauStock: mouvement.quantite,
      date: mouvement.date,
      motif: mouvement.motif ?? null,
    }));

  const achatsRecusTous = commandes.filter((commande) => commande.type === "ACHAT_FOURNISSEUR" && commande.statut === "RECUE");
  const statsParFournisseurId = new Map<string, { nombreCommandes: number; montantTotalAchete: number }>();
  const produitsParFournisseurId = new Map<string, Map<string, { quantiteTotale: number; montantTotal: number }>>();

  for (const commande of achatsRecusTous) {
    if (!commande.fournisseurId) continue;

    const stats = statsParFournisseurId.get(commande.fournisseurId) ?? { nombreCommandes: 0, montantTotalAchete: 0 };
    stats.nombreCommandes += 1;
    stats.montantTotalAchete += calculerMontantTotalCommande(commande.lignes);
    statsParFournisseurId.set(commande.fournisseurId, stats);

    const produitsDuFournisseur = produitsParFournisseurId.get(commande.fournisseurId) ?? new Map<string, { quantiteTotale: number; montantTotal: number }>();

    for (const ligne of commande.lignes) {
      const existant = produitsDuFournisseur.get(ligne.produitId) ?? { quantiteTotale: 0, montantTotal: 0 };
      existant.quantiteTotale += ligne.quantite;
      existant.montantTotal += ligne.quantite * ligne.prixApplique;
      produitsDuFournisseur.set(ligne.produitId, existant);
    }

    produitsParFournisseurId.set(commande.fournisseurId, produitsDuFournisseur);
  }

  const fournisseursAvecStats: FicheFournisseur[] = fournisseurs
    .map((fournisseur) => {
      const stats = statsParFournisseurId.get(fournisseur.id) ?? { nombreCommandes: 0, montantTotalAchete: 0 };
      const produitsFournis: ProduitFourni[] = [...(produitsParFournisseurId.get(fournisseur.id) ?? new Map())]
        .map(([produitId, produitStats]) => ({
          nom: nomsProduits.get(produitId) ?? produitId,
          quantiteTotale: produitStats.quantiteTotale,
          montantTotal: produitStats.montantTotal,
        }))
        .sort((a, b) => b.montantTotal - a.montantTotal);

      return {
        nom: fournisseur.nom,
        contact: fournisseur.contact,
        delaiLivraisonJours: fournisseur.delaiLivraisonJours ?? null,
        nombreCommandes: stats.nombreCommandes,
        montantTotalAchete: stats.montantTotalAchete,
        produitsFournis,
      };
    })
    .sort((a, b) => b.montantTotalAchete - a.montantTotalAchete);

  const dateDebutActivite = commandes.reduce(
    (plusAncienne, commande) => (commande.dateCommande < plusAncienne ? commande.dateCommande : plusAncienne),
    maintenant,
  );
  const nombreMoisTendance = Math.max(1, moisEcoules(dateDebutActivite, maintenant));

  const tendanceMensuelle = calculerTendanceMensuelle(commandes, maintenant, nombreMoisTendance);

  let finance:
    | {
        montantChargesDuMois: number;
        margeEstimee: number;
        chargesParType: FicheChargeParType[];
        tendanceCharges: MoisChargeTendance[];
        margeParMois: MoisChargeTendance[];
        equipe: MembreEquipe[];
      }
    | undefined;

  if (estAdministrateur) {
    const [charges, utilisateurs] = await Promise.all([
      listerCharges(chargeRepository, entrepriseId),
      listerUtilisateurs(utilisateurRepository, entrepriseId),
    ]);

    const chargesDuMois = charges.filter((charge) => charge.dateEcheance >= borneDebut && charge.dateEcheance <= borneFin);
    const montantChargesDuMois = chargesDuMois.reduce((total, charge) => total + charge.montant, 0);

    const statsParTypeCharge = new Map<string, { nombre: number; montantTotal: number; recurrente: boolean }>();
    for (const charge of charges) {
      const existant = statsParTypeCharge.get(charge.type) ?? { nombre: 0, montantTotal: 0, recurrente: charge.recurrente };
      existant.nombre += 1;
      existant.montantTotal += charge.montant;
      statsParTypeCharge.set(charge.type, existant);
    }

    const chargesParType: FicheChargeParType[] = [...statsParTypeCharge.entries()]
      .map(([type, stats]) => ({ type, nombre: stats.nombre, montantTotal: stats.montantTotal, recurrente: stats.recurrente }))
      .sort((a, b) => b.montantTotal - a.montantTotal);

    const equipe = utilisateurs.map((utilisateur) => ({
      nom: utilisateur.nom,
      role: utilisateur.role,
      actif: utilisateur.actif,
      salaire: utilisateur.salaire ?? null,
    }));

    const tendanceCharges = calculerTendanceChargesMensuelle(charges, maintenant, nombreMoisTendance);
    const margeParMois: MoisChargeTendance[] = tendanceMensuelle.map((mois, index) => ({
      libelle: mois.libelle,
      montant: mois.montantVentes - tendanceCharges[index].montant,
    }));

    finance = {
      montantChargesDuMois,
      margeEstimee: montantVentesDuMois - montantChargesDuMois,
      chargesParType,
      tendanceCharges,
      margeParMois,
      equipe,
    };
  }

  const contexte = construireContexteAssistant({
    nomEntreprise: entrepriseNom,
    nombreProduits: produits.length,
    valeurStock,
    alertes,
    montantVentesDuMois,
    montantAchatsDuMois,
    topProduitsVendus,
    produitsParId: nomsProduits,
    catalogue: construireCatalogue(produits, ventesParProduitToutes, attributsAffichageParProduit),
    tendanceMensuelle,
    fournisseurs: fournisseursAvecStats,
    commandesEnCours,
    tauxAnnulationCommandes,
    ajustementsStock,
    finance,
  });

  const reponse = await assistantIA.repondre(historique, question, contexte);

  await messageAssistantRepository.ajouter({ role: "UTILISATEUR", contenu: question }, session.id);
  await messageAssistantRepository.ajouter({ role: "ASSISTANT", contenu: reponse }, session.id);
  await sessionAssistantRepository.toucherDerniereActivite(session.id);

  return { session, reponse };
}
