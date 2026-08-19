const DUREE_VALIDITE_MS = 30 * 24 * 60 * 60 * 1000;

export function calculerExpirationTokenConfirmationCommande(maintenant: Date): Date {
  return new Date(maintenant.getTime() + DUREE_VALIDITE_MS);
}

export function tokenConfirmationCommandeEstValide(token: { dateExpiration: Date }, maintenant: Date): boolean {
  return token.dateExpiration > maintenant;
}
