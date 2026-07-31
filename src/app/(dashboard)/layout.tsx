import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

import { deconnexionAction } from "./actions";
import { getUtilisateurConnecte } from "../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaEntrepriseRepository } from "../../infrastructure/repositories/PrismaEntrepriseRepository";
import { variablesThemeEntreprise } from "../_lib/entrepriseTheme";
import { NavLinks } from "./_components/NavLinks";

const entrepriseRepository = new PrismaEntrepriseRepository();

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

  const initiale = entreprise.nom.trim().charAt(0).toUpperCase() || "V";

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-stone-900" style={variablesThemeEntreprise(entreprise)}>
      <div className="h-[3px] w-full" style={{ backgroundColor: "var(--color-primary)" }} />

      <div className="lg:flex">
        <aside className="border-b border-stone-200 bg-white px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r">
          <div className="mb-8 flex items-center gap-3">
            {entreprise.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entreprise.logo}
                alt={entreprise.nom}
                className="h-10 w-10 shrink-0 rounded-md border border-stone-200 bg-white object-contain p-1"
              />
            ) : (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md font-heading text-lg font-semibold"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
              >
                {initiale}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-heading text-lg font-semibold leading-none text-stone-900">Vantik</p>
              <p className="mt-1.5 truncate text-xs text-stone-500">{entreprise.nom}</p>
            </div>
          </div>

          <div className="mb-6 rounded-md border border-stone-200 bg-stone-50 p-3">
            <p className="truncate text-sm font-medium text-stone-900">{utilisateurConnecte.nom}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">{utilisateurConnecte.role}</p>
          </div>

          <NavLinks estAdministrateur={utilisateurConnecte.role === "ADMINISTRATEUR"} />

          <form action={deconnexionAction} className="mt-6 lg:mt-auto lg:pt-6">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Se déconnecter
            </button>
          </form>
        </aside>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
