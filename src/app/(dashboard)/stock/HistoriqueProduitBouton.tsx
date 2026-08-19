"use client";

import { useState } from "react";
import { History } from "lucide-react";

import { boutonClasses } from "../../_components/ui/boutonClasses";
import { Badge } from "../../_components/ui/Badge";
import { Modal } from "../../_components/ui/Modal";
import { LIBELLE_TYPE_MOUVEMENT } from "../../_lib/libellesStatuts";

export type MouvementAffichage = {
  id: string;
  dateAffichage: string;
  type: string;
  quantite: number;
  motif?: string | null;
  utilisateurNom?: string;
};

type HistoriqueProduitBoutonProps = {
  produitNom: string;
  mouvements: MouvementAffichage[];
};

export function HistoriqueProduitBouton({ produitNom, mouvements }: HistoriqueProduitBoutonProps) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOuvert(true)} className={boutonClasses("discret")}>
        <History className="h-3.5 w-3.5" strokeWidth={1.75} />
        Historique
      </button>

      <Modal
        open={ouvert}
        onClose={() => setOuvert(false)}
        title={`Historique — ${produitNom}`}
        description={`${mouvements.length} mouvement(s) enregistré(s).`}
        large
      >
        {mouvements.length === 0 ? (
          <p className="text-sm text-stone-500">Aucun mouvement pour ce produit pour le moment.</p>
        ) : (
          <div className="max-h-[65vh] overflow-y-auto overflow-x-auto rounded-2xl border border-stone-200">
            <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
              <thead className="bg-stone-50 text-stone-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 text-right font-medium">Quantité</th>
                  <th className="px-3 py-2 font-medium">Motif</th>
                  <th className="px-3 py-2 font-medium">Par</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {mouvements.map((mouvement) => {
                  const libelle = LIBELLE_TYPE_MOUVEMENT[mouvement.type];

                  return (
                    <tr key={mouvement.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-stone-700">{mouvement.dateAffichage}</td>
                      <td className="px-3 py-2">
                        {libelle ? <Badge variante={libelle.variante}>{libelle.label}</Badge> : mouvement.type}
                      </td>
                      <td className="px-3 py-2 text-right text-stone-700">{mouvement.quantite}</td>
                      <td className="px-3 py-2 text-stone-700">{mouvement.motif ?? "—"}</td>
                      <td className="px-3 py-2 text-stone-700">{mouvement.utilisateurNom ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </>
  );
}
