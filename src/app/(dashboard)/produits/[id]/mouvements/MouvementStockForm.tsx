"use client";

import { useActionState } from "react";

import type { MouvementStockState } from "./actions";

type MouvementStockFormProps = {
  produitId: string;
  action: (produitId: string, previousState: MouvementStockState, formData: FormData) => Promise<MouvementStockState>;
};

const initialState: MouvementStockState = {
  message: undefined,
  success: false,
};

export function MouvementStockForm({ produitId, action }: MouvementStockFormProps) {
  const boundAction = action.bind(null, produitId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Nouveau mouvement</h2>
        <p className="mt-1 text-sm text-zinc-500">Enregistre une entrée, une sortie ou un ajustement.</p>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-zinc-700">Type</span>
        <select name="type" required className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900">
          <option value="ENTREE">ENTREE</option>
          <option value="SORTIE">SORTIE</option>
          <option value="AJUSTEMENT">AJUSTEMENT</option>
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-zinc-700">Quantité</span>
        <input
          name="quantite"
          type="number"
          min="0"
          step="1"
          required
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
          placeholder="1"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-zinc-700">Motif</span>
        <textarea
          name="motif"
          rows={3}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
          placeholder="Ex: correction d'inventaire"
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
        {isPending ? "Enregistrement..." : "Enregistrer le mouvement"}
      </button>
    </form>
  );
}