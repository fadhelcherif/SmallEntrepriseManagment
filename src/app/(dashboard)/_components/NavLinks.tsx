"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Truck, ClipboardList, Receipt, BellRing, Users, ReceiptText, Settings, History, Bot, TrendingUp, type LucideIcon } from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

const ELEMENTS_NAVIGATION: NavItem[] = [
  { href: "/", label: "Accueil", icon: LayoutDashboard },
  { href: "/produits", label: "Produits", icon: Package },
  { href: "/stock", label: "Stock", icon: History },
  { href: "/fournisseurs", label: "Fournisseurs", icon: Truck },
  { href: "/commandes-fournisseurs", label: "Commandes fournisseurs", icon: ClipboardList },
  { href: "/commandes-clients", label: "Commandes clients", icon: Receipt },
  { href: "/alertes", label: "Alertes", icon: BellRing },
  { href: "/assistant", label: "Assistant", icon: Bot },
  { href: "/previsions", label: "Prévisions", icon: TrendingUp },
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
    <nav className="flex flex-col gap-1 text-sm font-medium">
      {elements.map((element) => {
        const estActif = element.href === "/" ? pathname === "/" : pathname.startsWith(element.href);
        const Icon = element.icon;

        return (
          <Link
            key={element.href}
            href={element.href}
            className={`flex items-center gap-3 rounded-full px-3.5 py-2.5 transition ${
              estActif ? "font-semibold" : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
            }`}
            style={estActif ? { backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" } : undefined}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{element.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
