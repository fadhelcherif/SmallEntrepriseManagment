"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Truck, ClipboardList, Receipt, BellRing, Settings, type LucideIcon } from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

const ELEMENTS_NAVIGATION: NavItem[] = [
  { href: "/", label: "Accueil", icon: LayoutDashboard },
  { href: "/produits", label: "Produits", icon: Package },
  { href: "/fournisseurs", label: "Fournisseurs", icon: Truck },
  { href: "/commandes-fournisseurs", label: "Commandes fournisseurs", icon: ClipboardList },
  { href: "/commandes-clients", label: "Commandes clients", icon: Receipt },
  { href: "/alertes", label: "Alertes", icon: BellRing },
];

type NavLinksProps = {
  afficherParametres: boolean;
};

export function NavLinks({ afficherParametres }: NavLinksProps) {
  const pathname = usePathname();
  const elements = afficherParametres
    ? [...ELEMENTS_NAVIGATION, { href: "/parametres", label: "Paramètres", icon: Settings }]
    : ELEMENTS_NAVIGATION;

  return (
    <nav className="flex flex-col gap-1 text-sm font-medium">
      {elements.map((element) => {
        const estActif = element.href === "/" ? pathname === "/" : pathname.startsWith(element.href);
        const Icon = element.icon;

        return (
          <Link
            key={element.href}
            href={element.href}
            className={`flex items-center gap-3 rounded-md px-3 py-2 transition ${
              estActif
                ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {element.label}
          </Link>
        );
      })}
    </nav>
  );
}
