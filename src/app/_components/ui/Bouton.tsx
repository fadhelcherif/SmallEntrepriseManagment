import type { ButtonHTMLAttributes } from "react";

import { boutonClasses, type VarianteBouton } from "./boutonClasses";

type BoutonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBouton;
};

export function Bouton({ variante = "primaire", className = "", ...props }: BoutonProps) {
  return <button className={boutonClasses(variante, className)} {...props} />;
}
