"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Truck, ClipboardList, Receipt, BellRing, Users, ReceiptText, Settings, History, type LucideIcon } from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

const ELEMENTS_NAVIGATION: NavItem[] = [
  { href: "/", label: "Accueil", icon: LayoutDashboard },
  { href: "/produits", label: "Produits", icon: Package },
  { href: "/stock", label: "Stock", icon: History },
  { href: "/fournisseurs", label: "Fournisseurs", icon: Truck },
  { href: "/commandes-fournisseurs", label: "Commandes fournisseurs", icon: ClipboardList },
  { href: "/commandes-clients", label: "Commandes clients", icon: Receipt },
  { href: "/alertes", label: "Alertes", icon: BellRing },
];

const ELEMENTS_NAVIGATION_ADMIN: NavItem[] = [
  { href: "/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/charges", label: "Charges", icon: ReceiptText },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

type NavLinksProps = {
  estAdministrateur: boolean;
};

export function NavLinks({ estAdministrateur }: NavLinksProps) {
  const pathname = usePathname();
  const elements = estAdministrateur ? [...ELEMENTS_NAVIGATION, ...ELEMENTS_NAVIGATION_ADMIN] : ELEMENTS_NAVIGATION;

  return (
    <nav className="flex flex-col gap-1.5 text-[11px] font-semibold tracking-wide uppercase">
      {elements.map((element) => {
        const estActif = element.href === "/" ? pathname === "/" : pathname.startsWith(element.href);
        const Icon = element.icon;

        return (
          <Link
            key={element.href}
            href={element.href}
            className={`flex items-center gap-3 px-1 py-1.5 transition ${estActif ? "text-white" : "text-stone-500 hover:text-stone-300"}`}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition"
              style={
                estActif
                  ? { backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }
                  : { borderColor: "#44403c" }
              }
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            </span>
            {element.label}
          </Link>
        );
      })}
    </nav>
  );
}
