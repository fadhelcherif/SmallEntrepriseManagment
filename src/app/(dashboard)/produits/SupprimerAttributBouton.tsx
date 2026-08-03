"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { supprimerAttributAction } from "./actions";
import { Bouton } from "../../_components/ui/Bouton";
import { Modal } from "../../_components/ui/Modal";

type SupprimerAttributBoutonProps = {
  attributId: string;
  nom: string;
};

export function SupprimerAttributBouton({ attributId, nom }: SupprimerAttributBoutonProps) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        aria-label={`Supprimer l'attribut ${nom}`}
        title="Supprimer cet attribut"
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-stone-400 transition hover:bg-red-50 hover:text-red-700"
      >
        <X className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>

      <Modal
        open={ouvert}
        onClose={() => setOuvert(false)}
        title={`Supprimer l'attribut « ${nom} » ?`}
        description="Retire cette colonne et les valeurs enregistrées pour tous les produits. Cette action est irréversible."
      >
        <div className="flex justify-end gap-2">
          <Bouton type="button" variante="discret" onClick={() => setOuvert(false)}>
            Annuler
          </Bouton>
          <form action={supprimerAttributAction.bind(null, attributId)}>
            <Bouton type="submit" variante="danger">
              Supprimer définitivement
            </Bouton>
          </form>
        </div>
      </Modal>
    </>
  );
}
