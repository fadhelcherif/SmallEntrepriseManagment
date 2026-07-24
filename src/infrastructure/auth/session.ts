import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import type { Utilisateur } from "../../domain/entities/Utilisateur";

export type SessionUtilisateur = Pick<Utilisateur, "id" | "entrepriseId" | "role" | "nom">;

const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET n'est pas défini.");
  }

  return new TextEncoder().encode(secret);
}

export async function creerSession(utilisateur: SessionUtilisateur): Promise<void> {
  const secret = getSessionSecret();
  const token = await new SignJWT({
    userId: utilisateur.id,
    nom: utilisateur.nom,
    entrepriseId: utilisateur.entrepriseId,
    role: utilisateur.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
    expires: new Date(Date.now() + SESSION_DURATION_SECONDS * 1000),
  });
}

export async function lireSession(): Promise<SessionUtilisateur | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());

    const userId = payload.userId;
    const nom = payload.nom;
    const entrepriseId = payload.entrepriseId;
    const role = payload.role;

    if (
      typeof userId !== "string"
      || typeof nom !== "string"
      || typeof entrepriseId !== "string"
      || (role !== "ADMINISTRATEUR" && role !== "EMPLOYE")
    ) {
      return null;
    }

    return {
      id: userId,
      nom,
      entrepriseId,
      role,
    };
  } catch {
    return null;
  }
}

export async function supprimerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}