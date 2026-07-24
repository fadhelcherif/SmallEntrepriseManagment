"use server";

import { redirect } from "next/navigation";

import { supprimerSession } from "../../infrastructure/auth/session";

export async function deconnexionAction(): Promise<void> {
  await supprimerSession();
  redirect("/login");
}