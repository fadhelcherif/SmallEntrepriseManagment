"use client";

import { useActionState } from "react";

import type { Entreprise } from "../../../domain/entities/Entreprise";
import type { ParametresEntrepriseState } from "./actions";

type ParametresEntrepriseFormProps = {
  entreprise: Entreprise;
  action: (previousState: ParametresEntrepriseState, formData: FormData) => Promise<ParametresEntrepriseState>;
};

const initialState: ParametresEntrepriseState = {
  message: undefined,
  success: false,
};

export function ParametresEntrepriseForm({ entreprise, action }: ParametresEntrepriseFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Paramètres de l'entreprise</h2>
        <p className="mt-1 text-sm text-zinc-500">Les changements sont réservés aux administrateurs.</p>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-zinc-700">Nom</span>
        <input
          name="nom"
          type="text"
          required
          defaultValue={entreprise.nom}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-zinc-700">Adresse</span>
        <input
          name="adresse"
          type="text"
          required
          defaultValue={entreprise.adresse}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-zinc-700">Devise</span>
        <input
          name="devise"
          type="text"
          required
          defaultValue={entreprise.devise}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-zinc-700">Type de métier</span>
        <input
          name="typeMetier"
          type="text"
          required
          defaultValue={entreprise.typeMetier}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-zinc-700">Catégorie</span>
        <input
          name="categorie"
          type="text"
          defaultValue={entreprise.categorie ?? ""}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-zinc-700">Logo</span>
        <input
          name="logo"
          type="text"
          defaultValue={entreprise.logo ?? ""}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-700">Couleur primaire</span>
          <input
            name="couleurPrimaire"
            type="text"
            defaultValue={entreprise.couleurPrimaire ?? ""}
            placeholder="#111827"
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-700">Couleur secondaire</span>
          <input
            name="couleurSecondaire"
            type="text"
            defaultValue={entreprise.couleurSecondaire ?? ""}
            placeholder="#F9FAFB"
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
          />
        </label>
      </div>

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
        {isPending ? "Enregistrement..." : "Enregistrer les changements"}
      </button>
    </form>
  );
}
