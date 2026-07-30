"use client";

import { useActionState, useState } from "react";
import { Save } from "lucide-react";

import type { Entreprise } from "../../../domain/entities/Entreprise";
import type { ParametresEntrepriseState } from "./actions";
import { Bouton } from "../../_components/ui/Bouton";
import { MessageFormulaire } from "../../_components/ui/MessageFormulaire";
import { champClasses } from "../../_components/ui/champClasses";
import { Panel } from "../../_components/ui/Panel";
import { texteLisibleSur } from "../../_lib/entrepriseTheme";

type ParametresEntrepriseFormProps = {
  entreprise: Entreprise;
  action: (previousState: ParametresEntrepriseState, formData: FormData) => Promise<ParametresEntrepriseState>;
};

const initialState: ParametresEntrepriseState = {
  message: undefined,
  success: false,
};

const COULEUR_PRIMAIRE_PAR_DEFAUT = "#1c1917";
const COULEUR_SECONDAIRE_PAR_DEFAUT = "#f5f5f4";

function estHexValide(valeur: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(valeur.trim());
}

export function ParametresEntrepriseForm({ entreprise, action }: ParametresEntrepriseFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [couleurPrimaire, setCouleurPrimaire] = useState(entreprise.couleurPrimaire ?? "");
  const [couleurSecondaire, setCouleurSecondaire] = useState(entreprise.couleurSecondaire ?? "");

  const primaireApercu = estHexValide(couleurPrimaire) ? couleurPrimaire : COULEUR_PRIMAIRE_PAR_DEFAUT;
  const secondaireApercu = estHexValide(couleurSecondaire) ? couleurSecondaire : COULEUR_SECONDAIRE_PAR_DEFAUT;

  return (
    <Panel title="Paramètres de l'entreprise" description="Les changements sont réservés aux administrateurs.">
      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Nom</span>
          <input name="nom" type="text" required defaultValue={entreprise.nom} className={champClasses} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Adresse</span>
          <input name="adresse" type="text" required defaultValue={entreprise.adresse} className={champClasses} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Devise</span>
          <input name="devise" type="text" required defaultValue={entreprise.devise} className={champClasses} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Type de métier</span>
          <input name="typeMetier" type="text" required defaultValue={entreprise.typeMetier} className={champClasses} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Catégorie</span>
          <input name="categorie" type="text" defaultValue={entreprise.categorie ?? ""} className={champClasses} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Logo</span>
          <input name="logo" type="text" defaultValue={entreprise.logo ?? ""} className={champClasses} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">Couleur primaire</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaireApercu}
                onChange={(event) => setCouleurPrimaire(event.target.value)}
                aria-label="Sélecteur de couleur primaire"
                className="h-[42px] w-12 shrink-0 cursor-pointer rounded-md border border-stone-300 bg-white p-1"
              />
              <input
                name="couleurPrimaire"
                type="text"
                value={couleurPrimaire}
                onChange={(event) => setCouleurPrimaire(event.target.value)}
                placeholder="#1C1917"
                className={`${champClasses} flex-1`}
              />
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">Couleur secondaire</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={secondaireApercu}
                onChange={(event) => setCouleurSecondaire(event.target.value)}
                aria-label="Sélecteur de couleur secondaire"
                className="h-[42px] w-12 shrink-0 cursor-pointer rounded-md border border-stone-300 bg-white p-1"
              />
              <input
                name="couleurSecondaire"
                type="text"
                value={couleurSecondaire}
                onChange={(event) => setCouleurSecondaire(event.target.value)}
                placeholder="#F5F5F4"
                className={`${champClasses} flex-1`}
              />
            </div>
          </label>
        </div>

        <div className="rounded-md border border-stone-200 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Aperçu</p>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium"
              style={{ backgroundColor: primaireApercu, color: texteLisibleSur(primaireApercu) }}
            >
              Bouton principal
            </span>
            <span
              className="inline-flex items-center justify-center rounded-md border px-4 py-2.5 text-sm font-medium"
              style={{ backgroundColor: secondaireApercu, color: texteLisibleSur(secondaireApercu), borderColor: primaireApercu }}
            >
              Fond secondaire
            </span>
          </div>
        </div>

        <MessageFormulaire message={state.message} success={state.success} />

        <Bouton type="submit" disabled={isPending}>
          <Save className="h-4 w-4" strokeWidth={1.75} />
          {isPending ? "Enregistrement..." : "Enregistrer les changements"}
        </Bouton>
      </form>
    </Panel>
  );
}
