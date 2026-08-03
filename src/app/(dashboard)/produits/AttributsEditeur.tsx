"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { champClasses } from "../../_components/ui/champClasses";

export type AttributLigne = {
  nom: string;
  valeur: string;
};

type AttributsEditeurProps = {
  nomsExistants: string[];
  valeursInitiales?: AttributLigne[];
};

export function AttributsEditeur({ nomsExistants, valeursInitiales = [] }: AttributsEditeurProps) {
  const [lignes, setLignes] = useState<AttributLigne[]>(valeursInitiales);

  const lignesJson = useMemo(() => JSON.stringify(lignes), [lignes]);

  return (
    <div className="grid gap-3">
      <input type="hidden" name="attributsJson" value={lignesJson} />

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-stone-700">Attributs personnalisés</span>
        <button
          type="button"
          onClick={() => setLignes((current) => [...current, { nom: "", valeur: "" }])}
          className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          Ajouter un attribut
        </button>
      </div>

      {lignes.length === 0 ? (
        <p className="text-xs text-stone-500">Ex : Taille, Couleur, Numéro de lot... Ajoute un champ propre à ce produit.</p>
      ) : (
        lignes.map((ligne, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 rounded-md border border-stone-200 bg-stone-50 p-3">
            <input
              type="text"
              list="noms-attributs-existants"
              value={ligne.nom}
              onChange={(event) => {
                const nom = event.target.value;
                setLignes((current) => current.map((ligneCourante, ligneIndex) => (ligneIndex === index ? { ...ligneCourante, nom } : ligneCourante)));
              }}
              placeholder="Nom (ex: Taille)"
              className={champClasses}
            />

            <input
              type="text"
              value={ligne.valeur}
              onChange={(event) => {
                const valeur = event.target.value;
                setLignes((current) => current.map((ligneCourante, ligneIndex) => (ligneIndex === index ? { ...ligneCourante, valeur } : ligneCourante)));
              }}
              placeholder="Valeur (ex: M)"
              className={champClasses}
            />

            <button
              type="button"
              onClick={() => setLignes((current) => current.filter((_, ligneIndex) => ligneIndex !== index))}
              aria-label="Supprimer cet attribut"
              title="Supprimer cet attribut"
              className="inline-flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ))
      )}

      <datalist id="noms-attributs-existants">
        {nomsExistants.map((nom) => (
          <option key={nom} value={nom} />
        ))}
      </datalist>
    </div>
  );
}
