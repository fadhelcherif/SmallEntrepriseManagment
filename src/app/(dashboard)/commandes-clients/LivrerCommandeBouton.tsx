"use client";

import { useActionState, useEffect, useState } from "react";
import { PackageMinus } from "lucide-react";

import type { Commande } from "../../../domain/entities/Commande";
import type { LivrerCommandeVenteState } from "./actions";
import { Bouton } from "../../_components/ui/Bouton";
import { Modal } from "../../_components/ui/Modal";

type LivrerCommandeBoutonProps = {
  entrepriseId: string;
  commande: Commande;
  action: (
    entrepriseId: string,
    previousState: LivrerCommandeVenteState,
    formData: FormData,
  ) => Promise<LivrerCommandeVenteState>;
};

const etatInitial: LivrerCommandeVenteState = {
  message: undefined,
  success: undefined,
};

export function LivrerCommandeBouton({ entrepriseId, commande, action }: LivrerCommandeBoutonProps) {
  const [state, formAction, enCours] = useActionState(action.bind(null, entrepriseId), etatInitial);
  const [erreurOuverte, setErreurOuverte] = useState(false);

  useEffect(() => {
    if (state.message && !state.success) {
      setErreurOuverte(true);
    }
  }, [state]);

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="commandeJson" value={JSON.stringify(commande)} />
        <Bouton type="submit" variante="succes" disabled={enCours}>
          <PackageMinus className="h-3.5 w-3.5" strokeWidth={1.75} />
          {enCours ? "Livraison..." : "Livrer"}
        </Bouton>
      </form>

      <Modal
        open={erreurOuverte}
        onClose={() => setErreurOuverte(false)}
        title="Impossible de livrer cette commande"
        description={state.message}
      >
        <div className="flex justify-end">
          <Bouton type="button" variante="discret" onClick={() => setErreurOuverte(false)}>
            Fermer
          </Bouton>
        </div>
      </Modal>
    </>
  );
}
