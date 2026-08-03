"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { supprimerChargeAction } from "./actions";
import { Bouton } from "../../_components/ui/Bouton";
import { Modal } from "../../_components/ui/Modal";

type ChargeActionsProps = {
  chargeId: string;
  libelle: string;
};

export function ChargeActions({ chargeId, libelle }: ChargeActionsProps) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        aria-label={`Supprimer ${libelle}`}
        title="Supprimer"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:border-red-300 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      </button>

      <Modal
        open={ouvert}
        onClose={() => setOuvert(false)}
        title={`Supprimer « ${libelle} » ?`}
        description="Cette action est irréversible."
      >
        <div className="flex justify-end gap-2">
          <Bouton type="button" variante="discret" onClick={() => setOuvert(false)}>
            Annuler
          </Bouton>
          <form action={supprimerChargeAction.bind(null, chargeId)}>
            <Bouton type="submit" variante="danger">
              Supprimer définitivement
            </Bouton>
          </form>
        </div>
      </Modal>
    </>
  );
}
