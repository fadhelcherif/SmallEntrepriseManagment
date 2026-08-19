export class IdentifiantsInvalidesError extends Error {
  constructor(message = "Identifiants invalides.") {
    super(message);
    this.name = "IdentifiantsInvalidesError";
  }
}

export class UtilisateurDejaExistantError extends Error {
  constructor(message = "Un utilisateur existe déjà avec cet email.") {
    super(message);
    this.name = "UtilisateurDejaExistantError";
  }
}

export class TokenReinitialisationInvalideError extends Error {
  constructor(message = "Ce lien de réinitialisation est invalide ou a expiré.") {
    super(message);
    this.name = "TokenReinitialisationInvalideError";
  }
}

export class TokenConfirmationCommandeInvalideError extends Error {
  constructor(message = "Ce lien de commande est invalide ou a expiré.") {
    super(message);
    this.name = "TokenConfirmationCommandeInvalideError";
  }
}