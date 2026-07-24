import type { SessionUtilisateur } from "./session";
import { lireSession } from "./session";

export async function getUtilisateurConnecte(): Promise<SessionUtilisateur | null> {
  return lireSession();
}