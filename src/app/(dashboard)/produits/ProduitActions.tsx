"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import type { Produit } from "../../../domain/entities/Produit";

import { modifierProduitAction, supprimerProduitAction, type SupprimerProduitState } from "./actions";
import { AttributsEditeur, type AttributLigne } from "./AttributsEditeur";
import { Bouton } from "../../_components/ui/Bouton";
import { champClasses } from "../../_components/ui/champClasses";
import { MessageFormulaire } from "../../_components/ui/MessageFormulaire";
import { Modal } from "../../_components/ui/Modal";

const etatInitialSuppression: SupprimerProduitState = {
  message: undefined,
  success: undefined,
};

type ProduitActionsProps = {
  entrepriseId: string;
  produit: Produit;
  nomsAttributsExistants: string[];
  attributsInitiaux: AttributLigne[];
};

function formaterDatePourInput(date?: Date | null): string {
  if (!date) {
    return "";
  }

  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");

  return `${annee}-${mois}-${jour}`;
}

export function ProduitActions({ entrepriseId, produit, nomsAttributsExistants, attributsInitiaux }: ProduitActionsProps) {
  const [modifierOuvert, setModifierOuvert] = useState(false);
  const [supprimerOuvert, setSupprimerOuvert] = useState(false);
  const [supprimerState, supprimerAction, suppressionEnCours] = useActionState(
    supprimerProduitAction.bind(null, entrepriseId, produit.id),
    etatInitialSuppression,
  );

  useEffect(() => {
    if (supprimerState.success) {
      setSupprimerOuvert(false);
    }
  }, [supprimerState.success]);

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setModifierOuvert(true)}
          aria-label={`Modifier ${produit.nom}`}
          title="Modifier"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 text-stone-600 transition hover:border-stone-900 hover:text-stone-900"
        >
          <Pencil className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={() => setSupprimerOuvert(true)}
          aria-label={`Supprimer ${produit.nom}`}
          title="Supprimer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:border-red-300 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <Modal
        open={modifierOuvert}
        onClose={() => setModifierOuvert(false)}
        title={`Modifier « ${produit.nom} »`}
        description="Les changements sont appliqués immédiatement au catalogue."
      >
        <form
          action={modifierProduitAction.bind(null, entrepriseId, produit.id)}
          onSubmit={() => setModifierOuvert(false)}
          className="grid gap-4"
        >
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-stone-700">Nom</span>
            <input name="nom" type="text" required defaultValue={produit.nom} className={champClasses} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-stone-700">Prix d’achat</span>
              <input
                name="prixAchat"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={produit.prixAchat}
                className={champClasses}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-stone-700">Prix de vente</span>
              <input
                name="prixVente"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={produit.prixVente}
                className={champClasses}
              />
            </label>
          </div>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-stone-700">Seuil d’alerte</span>
            <input
              name="seuilAlerte"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={produit.seuilAlerte}
              className={champClasses}
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-stone-700">Description</span>
            <textarea name="description" rows={3} defaultValue={produit.description ?? ""} className={champClasses} />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-stone-700">Date d’expiration</span>
            <input
              name="dateExpiration"
              type="date"
              defaultValue={formaterDatePourInput(produit.dateExpiration)}
              className={champClasses}
            />
          </label>

          <AttributsEditeur nomsExistants={nomsAttributsExistants} valeursInitiales={attributsInitiaux} />

          <div className="flex justify-end gap-2 pt-2">
            <Bouton type="button" variante="discret" onClick={() => setModifierOuvert(false)}>
              Annuler
            </Bouton>
            <Bouton type="submit">Enregistrer</Bouton>
          </div>
        </form>
      </Modal>

      <Modal
        open={supprimerOuvert}
        onClose={() => setSupprimerOuvert(false)}
        title={`Supprimer « ${produit.nom} » ?`}
        description="Cette action est irréversible et retire définitivement le produit du catalogue."
      >
        <form action={supprimerAction} className="flex flex-col gap-3">
          <MessageFormulaire message={supprimerState.message} success={supprimerState.success} />

          <div className="flex justify-end gap-2">
            <Bouton type="button" variante="discret" onClick={() => setSupprimerOuvert(false)}>
              Annuler
            </Bouton>
            <Bouton type="submit" variante="danger" disabled={suppressionEnCours}>
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              {suppressionEnCours ? "Suppression..." : "Supprimer définitivement"}
            </Bouton>
          </div>
        </form>
      </Modal>
    </>
  );
}
