"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import type { Utilisateur } from "../../../domain/entities/Utilisateur";
import { modifierUtilisateurAction } from "./actions";
import { Bouton } from "../../_components/ui/Bouton";
import { champClasses } from "../../_components/ui/champClasses";
import { Modal } from "../../_components/ui/Modal";

type UtilisateurActionsProps = {
  utilisateur: Utilisateur;
};

export function UtilisateurActions({ utilisateur }: UtilisateurActionsProps) {
  const [modifierOuvert, setModifierOuvert] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModifierOuvert(true)}
        aria-label={`Modifier ${utilisateur.nom}`}
        title="Modifier"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 text-stone-600 transition hover:border-stone-900 hover:text-stone-900"
      >
        <Pencil className="h-4 w-4" strokeWidth={1.75} />
      </button>

      <Modal
        open={modifierOuvert}
        onClose={() => setModifierOuvert(false)}
        title={`Modifier « ${utilisateur.nom} »`}
        description="Les changements sont appliqués immédiatement."
      >
        <form
          action={modifierUtilisateurAction.bind(null, utilisateur.id)}
          onSubmit={() => setModifierOuvert(false)}
          className="grid gap-4"
        >
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-stone-700">Nom</span>
            <input name="nom" type="text" required defaultValue={utilisateur.nom} className={champClasses} />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-stone-700">Email</span>
            <input name="email" type="email" required defaultValue={utilisateur.email} className={champClasses} />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-stone-700">Rôle</span>
            <select name="role" defaultValue={utilisateur.role} className={champClasses}>
              <option value="EMPLOYE">Employé</option>
              <option value="ADMINISTRATEUR">Administrateur</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
            <input
              type="checkbox"
              name="actif"
              defaultChecked={utilisateur.actif}
              className="h-4 w-4 rounded border-stone-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            Compte actif
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Bouton type="button" variante="discret" onClick={() => setModifierOuvert(false)}>
              Annuler
            </Bouton>
            <Bouton type="submit">Enregistrer</Bouton>
          </div>
        </form>
      </Modal>
    </>
  );
}
