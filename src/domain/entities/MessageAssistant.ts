export type RoleMessageAssistant = "UTILISATEUR" | "ASSISTANT";

export type MessageAssistant = {
  id: string;
  sessionId: string;
  role: RoleMessageAssistant;
  contenu: string;
  dateCreation: Date;
};

export type NouveauMessageAssistant = {
  role: RoleMessageAssistant;
  contenu: string;
};
