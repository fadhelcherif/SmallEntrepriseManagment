import { randomBytes } from "crypto";

const DUREE_VALIDITE_MS = 60 * 60 * 1000;

export function genererToken(): string {
  return randomBytes(32).toString("hex");
}

export function calculerExpirationToken(maintenant: Date): Date {
  return new Date(maintenant.getTime() + DUREE_VALIDITE_MS);
}

export function tokenEstValide(token: { utilise: boolean; dateExpiration: Date }, maintenant: Date): boolean {
  return !token.utilise && token.dateExpiration > maintenant;
}
