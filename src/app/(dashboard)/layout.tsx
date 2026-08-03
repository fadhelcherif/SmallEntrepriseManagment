import type { ReactNode } from "react";
import Link from "next/link";
import { LogOut, Settings, BellRing, UserRound } from "lucide-react";
import { redirect } from "next/navigation";

import { deconnexionAction } from "./actions";
import { getUtilisateurConnecte } from "../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaEntrepriseRepository } from "../../infrastructure/repositories/PrismaEntrepriseRepository";
import { PrismaAlerteRepository } from "../../infrastructure/repositories/PrismaAlerteRepository";
import { listerAlertes } from "../../application/alertes/listerAlertes";
import { variablesThemeEntreprise } from "../_lib/entrepriseTheme";
import { NavLinks } from "./_components/NavLinks";
import { CompteurBadge } from "../_components/ui/CompteurBadge";

const entrepriseRepository = new PrismaEntrepriseRepository();
const alerteRepository = new PrismaAlerteRepository();

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const entreprise = await entrepriseRepository.trouverParId(utilisateurConnecte.entrepriseId);

  if (!entreprise) {
    redirect("/login");
  }

  const alertes = await listerAlertes(alerteRepository, utilisateurConnecte.entrepriseId);
  const estAdministrateur = utilisateurConnecte.role === "ADMINISTRATEUR";
  const initiale = entreprise.nom.trim().charAt(0).toUpperCase() || "V";

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-stone-900" style={variablesThemeEntreprise(entreprise)}>
      <div className="lg:flex">
        <aside className="bg-stone-900 px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
          <div className="mb-8 border-b border-stone-800 pb-6">
            <p className="font-heading text-lg leading-none font-bold text-white">
              Vantik<span style={{ color: "var(--color-primary)" }}>.</span>
            </p>
            <p className="mt-1.5 truncate text-[11px] font-semibold tracking-wide text-stone-500 uppercase">{entreprise.nom}</p>
          </div>

          <NavLinks estAdministrateur={estAdministrateur} />

          <form action={deconnexionAction} className="mt-6 lg:mt-auto lg:pt-6">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-700 bg-stone-800 px-4 py-2.5 text-xs font-semibold tracking-wider text-stone-300 uppercase transition hover:bg-stone-700 hover:text-white"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Se déconnecter
            </button>
          </form>
        </aside>

        <div className="min-w-0 flex-1">
          <div>
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 pt-6 pb-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                {entreprise.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entreprise.logo}
                    alt={entreprise.nom}
                    className="h-14 w-14 shrink-0 rounded-full border border-stone-200 bg-white object-contain p-1"
                  />
                ) : (
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold"
                    style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
                  >
                    {initiale}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-stone-900">
                    Bienvenue, {utilisateurConnecte.nom}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-stone-500 uppercase">
                      {estAdministrateur ? "Administrateur" : "Employé"}
                    </span>
                    <span className="truncate text-xs text-stone-500">{entreprise.nom}</span>
                  </div>
                  <span className="mt-2 block h-[3px] w-16 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="hidden items-center gap-2 sm:flex">
                  <p className="text-sm font-medium text-stone-700">{utilisateurConnecte.nom}</p>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-stone-400">
                    <UserRound className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                </div>

                <span className="hidden h-8 w-px bg-stone-200 sm:block" />

                {estAdministrateur ? (
                  <>
                    <Link
                      href="/parametres"
                      aria-label="Paramètres"
                      className="flex h-11 w-11 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                    >
                      <Settings className="h-5.5 w-5.5" strokeWidth={1.75} />
                    </Link>
                    <span className="h-8 w-px bg-stone-200" />
                  </>
                ) : null}

                <Link
                  href="/alertes"
                  aria-label="Alertes"
                  className="relative flex h-11 w-11 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                >
                  <BellRing className="h-5.5 w-5.5" strokeWidth={1.75} />
                  {alertes.length > 0 ? (
                    <span className="absolute -top-1 -right-1">
                      <CompteurBadge nombre={alertes.length} />
                    </span>
                  ) : null}
                </Link>
              </div>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
