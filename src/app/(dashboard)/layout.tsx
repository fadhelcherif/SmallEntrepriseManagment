import type { ReactNode } from "react";
import Link from "next/link";
import { LogOut, Settings, BellRing, UserRound, Sparkles, ArrowUpRight } from "lucide-react";
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
        <aside className="bg-white px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0 lg:flex-col">
          <div className="mb-8 flex items-center gap-3 px-1">
            {entreprise.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entreprise.logo}
                alt={entreprise.nom}
                className="h-11 w-11 shrink-0 rounded-2xl border border-stone-200 bg-white object-contain p-1.5"
              />
            ) : (
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base font-bold"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
              >
                {initiale}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-bold text-stone-900">{entreprise.nom}</p>
              <p className="text-[11px] font-medium text-stone-400">Vantik</p>
            </div>
          </div>

          <NavLinks estAdministrateur={estAdministrateur} />

          <div className="mt-6 lg:mt-auto lg:pt-6">
            <Link
              href="/assistant"
              className="group flex flex-col gap-3 rounded-2xl p-4 text-white transition hover:opacity-95"
              style={{ backgroundColor: "#1c1917" }}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
              >
                <Sparkles className="h-4.5 w-4.5" strokeWidth={1.75} />
              </span>
              <span className="text-sm leading-snug font-semibold">Besoin de conseils ? Demande à l&apos;assistant Vantik.</span>
              <span
                className="inline-flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition group-hover:gap-1.5"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
              >
                Ouvrir
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </Link>

            <form action={deconnexionAction} className="mt-3">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold tracking-wide text-stone-400 uppercase transition hover:bg-stone-100 hover:text-stone-700"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Se déconnecter
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div>
            <div className="flex w-full items-center justify-between gap-4 px-5 pt-5 pb-3 sm:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <span className="shadow-card flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400">
                  <UserRound className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-stone-400">Bienvenue</p>
                  <p className="truncate font-heading text-lg font-bold text-stone-900">{utilisateurConnecte.nom}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-semibold tracking-wide text-stone-500 uppercase sm:inline-block">
                  {estAdministrateur ? "Administrateur" : "Employé"}
                </span>

                {estAdministrateur ? (
                  <Link
                    href="/parametres"
                    aria-label="Paramètres"
                    className="shadow-card flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 transition hover:text-stone-900"
                  >
                    <Settings className="h-5 w-5" strokeWidth={1.75} />
                  </Link>
                ) : null}

                <Link
                  href="/alertes"
                  aria-label="Alertes"
                  className="shadow-card relative flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 transition hover:text-stone-900"
                >
                  <BellRing className="h-5 w-5" strokeWidth={1.75} />
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
