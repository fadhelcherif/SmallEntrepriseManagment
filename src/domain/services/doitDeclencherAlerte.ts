export function doitDeclencherAlerte(quantiteStock: number, seuilAlerte: number): boolean {
  return quantiteStock <= seuilAlerte;
}