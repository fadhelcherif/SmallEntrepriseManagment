"use client";

import { useActionState } from "react";

import type { CreerFournisseurState } from "./actions";

type FournisseursFormProps = {
  entrepriseId: string;
  action: (entrepriseId: string, previousState: CreerFournisseurState, formData: FormData) => Promise<CreerFournisseurState>;
};

const initialState: CreerFournisseurState = {
  message: undefined,
  success: false,
};

export function FournisseursForm({ entrepriseId, action }: FournisseursFormProps) {
  const [state, formAction, isPending] = useActionState(action.bind(null, entrepriseId), initialState);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900">Nouveau fournisseur</h2>
        <p className="mt-1 text-sm text-zinc-500">Ajoute un fournisseur au catalogue de l’entreprise.</p>
      </div>

      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-700">Nom</span>
          <input
            name="nom"
            type="text"
            required
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            placeholder="Ex: Fournitures Express"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-700">Contact</span>
          <input
            name="contact"
            type="text"
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            placeholder="Téléphone ou email"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-700">Adresse</span>
          <input
            name="adresse"
            type="text"
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            placeholder="Adresse du fournisseur"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-700">Délai de livraison (jours)</span>
          <input
            name="delaiLivraisonJours"
            type="number"
            min="0"
            step="1"
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
          {isPending ? "Création..." : "Créer le fournisseur"}
        </button>
      </form>
    </section>
  );
}