import { redirect } from "next/navigation";

import { listerAlertes } from "../../../application/alertes/listerAlertes";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaAlerteRepository } from "../../../infrastructure/repositories/PrismaAlerteRepository";
import { marquerAlerteCommeLueAction } from "./actions";

const repository = new PrismaAlerteRepository();

function formaterDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AlertesPage() {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const alertes = await listerAlertes(repository, utilisateurConnecte.entrepriseId);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">Vantik</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Alertes non lues</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Alertes actives pour l'entreprise connectée.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-900">Alertes</h2>
            <p className="mt-1 text-sm text-zinc-500">{alertes.length} alerte(s) non lue(s).</p>
          </div>

          {alertes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-sm text-zinc-500">
              Aucune alerte non lue pour le moment.
            </p>
          ) : (
            <div className="grid gap-3">
              {alertes.map((alerte) => (
                <article key={alerte.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{alerte.type}</p>
                      <p className="mt-1 text-sm text-zinc-700">{alerte.message}</p>
                      <p className="mt-2 text-xs text-zinc-500">{formaterDate(alerte.dateGeneration)}</p>
                    </div>

                    <form action={marquerAlerteCommeLueAction.bind(null, alerte.id)}>
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
                      >
                        Marquer comme lue
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}