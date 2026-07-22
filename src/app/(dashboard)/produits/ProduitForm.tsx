"use client";

import { useActionState } from "react";

import type { CreerProduitState } from "./actions";

type ProduitFormProps = {
  entrepriseId: string;
  action: (entrepriseId: string, previousState: CreerProduitState, formData: FormData) => Promise<CreerProduitState>;
};

const initialState: CreerProduitState = {
  message: undefined,
  success: false,
};

export function ProduitForm({ entrepriseId, action }: ProduitFormProps) {
  const boundAction = action.bind(null, entrepriseId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900">Nouveau produit</h2>
        <p className="mt-1 text-sm text-zinc-500">Ajoute un produit au catalogue de l’entreprise.</p>
      </div>

      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-700">Nom</span>
          <input
            name="nom"
            type="text"
            required
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            placeholder="Ex: Café moulu 1kg"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-700">Prix unitaire</span>
          <input
            name="prixUnitaire"
            type="number"
            step="0.01"
            min="0"
            required
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            placeholder="19.90"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-700">Seuil d’alerte</span>
          <input
            name="seuilAlerte"
            type="number"
            min="0"
            step="1"
            required
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            placeholder="3"
          />
        </label>

        {state.message ? (
          <p className={`rounded-xl px-3 py-2 text-sm ${state.success ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Création..." : "Créer le produit"}
        </button>
      </form>
    </section>
  );
}