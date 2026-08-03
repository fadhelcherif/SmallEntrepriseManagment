import { redirect } from "next/navigation";
import { BellRing, CheckCircle2 } from "lucide-react";

import { listerAlertes } from "../../../application/alertes/listerAlertes";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaAlerteRepository } from "../../../infrastructure/repositories/PrismaAlerteRepository";
import { marquerAlerteCommeLueAction } from "./actions";
import { PageHeader } from "../../_components/ui/PageHeader";
import { Panel } from "../../_components/ui/Panel";
import { EmptyState } from "../../_components/ui/EmptyState";
import { Badge } from "../../_components/ui/Badge";
import { Bouton } from "../../_components/ui/Bouton";

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
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <PageHeader title="Alertes non lues" description="Alertes actives pour l'entreprise connectée." />

        <Panel title="Alertes" description={`${alertes.length} alerte(s) non lue(s).`}>
          {alertes.length === 0 ? (
            <EmptyState
              icon={BellRing}
              title="Aucune alerte non lue"
              description="Tout est sous contrôle : les alertes de stock ou d'expiration apparaîtront ici."
            />
          ) : (
            <div className="grid gap-3">
              {alertes.map((alerte) => (
                <article key={alerte.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Badge variante="avertissement">{alerte.type}</Badge>
                      <p className="mt-2 text-sm text-stone-700">{alerte.message}</p>
                      <p className="mt-2 text-xs text-stone-500">{formaterDate(alerte.dateGeneration)}</p>
                    </div>

                    <form action={marquerAlerteCommeLueAction.bind(null, alerte.id)}>
                      <Bouton type="submit" variante="discret">
                        <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Marquer comme lue
                      </Bouton>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </main>
  );
}
