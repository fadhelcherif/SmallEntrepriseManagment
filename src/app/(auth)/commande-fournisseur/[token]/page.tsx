import { chargerCommandeParTokenConfirmation } from "../../../../application/commandes/chargerCommandeParTokenConfirmation";
import { TokenConfirmationCommandeInvalideError } from "../../../../domain/services/errors";
import { calculerMontantTotalCommande } from "../../../../domain/services/calculerMontantCommande";
import { PrismaTokenConfirmationCommandeRepository } from "../../../../infrastructure/repositories/PrismaTokenConfirmationCommandeRepository";
import { PrismaCommandeRepository } from "../../../../infrastructure/repositories/PrismaCommandeRepository";
import { PrismaEntrepriseRepository } from "../../../../infrastructure/repositories/PrismaEntrepriseRepository";
import { PrismaFournisseurRepository } from "../../../../infrastructure/repositories/PrismaFournisseurRepository";
import { PrismaProduitRepository } from "../../../../infrastructure/repositories/PrismaProduitRepository";

const tokenRepository = new PrismaTokenConfirmationCommandeRepository();
const commandeRepository = new PrismaCommandeRepository();
const entrepriseRepository = new PrismaEntrepriseRepository();
const fournisseurRepository = new PrismaFournisseurRepository();
const produitRepository = new PrismaProduitRepository();

type PageProps = {
  params: Promise<{ token: string }>;
};

function formaterDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

export default async function CommandeFournisseurPage({ params }: PageProps) {
  const { token } = await params;

  let affichage;

  try {
    affichage = await chargerCommandeParTokenConfirmation(
      tokenRepository,
      commandeRepository,
      entrepriseRepository,
      fournisseurRepository,
      produitRepository,
      token,
    );
  } catch (error) {
    const message =
      error instanceof TokenConfirmationCommandeInvalideError
        ? error.message
        : "Une erreur est survenue lors du chargement de cette commande.";

    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f2ea] px-6">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="font-heading text-lg font-semibold text-stone-900">Lien invalide</p>
          <p className="mt-2 text-sm text-stone-600">{message}</p>
        </div>
      </main>
    );
  }

  const { commande, nomEntreprise, nomFournisseur, nomsProduits } = affichage;
  const total = calculerMontantTotalCommande(commande.lignes);

  return (
    <main className="min-h-screen bg-[#f6f2ea] px-6 py-12">
      <div className="mx-auto w-full max-w-2xl rounded-3xl bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">Vantik</p>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-stone-900">
          Commande de {nomEntreprise}
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          {nomFournisseur ? `Bonjour ${nomFournisseur}, ` : ""}
          voici le détail de la commande passée le {formaterDate(commande.dateCommande)}.
        </p>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200">
          <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Produit</th>
                <th className="px-4 py-3 text-right font-medium">Quantité</th>
                <th className="px-4 py-3 text-right font-medium">Prix unitaire</th>
                <th className="px-4 py-3 text-right font-medium">Sous-total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {commande.lignes.map((ligne) => (
                <tr key={ligne.id}>
                  <td className="px-4 py-3 text-stone-700">{nomsProduits.get(ligne.produitId) ?? ligne.produitId}</td>
                  <td className="px-4 py-3 text-right text-stone-700">{ligne.quantite}</td>
                  <td className="px-4 py-3 text-right text-stone-700">{ligne.prixApplique.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-stone-700">{(ligne.quantite * ligne.prixApplique).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-stone-200 bg-stone-50">
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-stone-700">
                  Total commande
                </td>
                <td className="px-4 py-3 text-right font-heading font-semibold text-stone-900">{total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="mt-6 text-xs text-stone-400">
          Ce lien reste consultable pendant 30 jours après l&apos;envoi de la commande.
        </p>
      </div>
    </main>
  );
}
