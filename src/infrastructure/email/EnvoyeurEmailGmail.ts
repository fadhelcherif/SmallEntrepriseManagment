import nodemailer, { type Transporter } from "nodemailer";

import type { EnvoyeurEmail } from "../../domain/services/EnvoyeurEmail";

function creerTransporteur(): Transporter {
  const utilisateur = process.env.GMAIL_USER;
  const motDePasse = process.env.GMAIL_APP_PASSWORD;

  if (!utilisateur || !motDePasse) {
    throw new Error("GMAIL_USER et GMAIL_APP_PASSWORD doivent être définis pour envoyer des emails.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: utilisateur, pass: motDePasse },
  });
}

export class EnvoyeurEmailGmail implements EnvoyeurEmail {
  async envoyer(destinataire: string, sujet: string, contenuTexte: string): Promise<void> {
    const transporteur = creerTransporteur();

    await transporteur.sendMail({
      from: `Vantik <${process.env.GMAIL_USER}>`,
      to: destinataire,
      subject: sujet,
      text: contenuTexte,
    });
  }
}
