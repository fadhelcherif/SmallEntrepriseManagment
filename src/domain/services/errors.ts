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