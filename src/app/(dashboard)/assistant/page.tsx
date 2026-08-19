import { redirect } from "next/navigation";

import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaSessionAssistantRepository } from "../../../infrastructure/repositories/PrismaSessionAssistantRepository";
import { listerSessionsAssistant } from "../../../application/assistant/listerSessionsAssistant";
import { AssistantChat } from "./AssistantChat";

const sessionAssistantRepository = new PrismaSessionAssistantRepository();

export default async function AssistantPage() {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const sessions = await listerSessionsAssistant(
    sessionAssistantRepository,
    utilisateurConnecte.entrepriseId,
    utilisateurConnecte.id,
  );

  return (
    <main className="px-5 py-6 sm:px-8">
      <div className="flex h-[calc(100vh-140px)] w-full flex-col">
        <AssistantChat
          entrepriseId={utilisateurConnecte.entrepriseId}
          utilisateurId={utilisateurConnecte.id}
          sessions={sessions}
          sessionActive={null}
          messagesInitiaux={[]}
        />
      </div>
    </main>
  );
}
