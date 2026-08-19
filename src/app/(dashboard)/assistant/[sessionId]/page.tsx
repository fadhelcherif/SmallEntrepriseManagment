import { redirect } from "next/navigation";

import { getUtilisateurConnecte } from "../../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaSessionAssistantRepository } from "../../../../infrastructure/repositories/PrismaSessionAssistantRepository";
import { PrismaMessageAssistantRepository } from "../../../../infrastructure/repositories/PrismaMessageAssistantRepository";
import { listerSessionsAssistant } from "../../../../application/assistant/listerSessionsAssistant";
import { chargerSessionAssistant, SessionAssistantIntrouvableError } from "../../../../application/assistant/chargerSessionAssistant";
import { AssistantChat } from "../AssistantChat";

const sessionAssistantRepository = new PrismaSessionAssistantRepository();
const messageAssistantRepository = new PrismaMessageAssistantRepository();

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function SessionAssistantPage({ params }: PageProps) {
  const { sessionId } = await params;
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const [sessions, sessionChargee] = await Promise.all([
    listerSessionsAssistant(sessionAssistantRepository, utilisateurConnecte.entrepriseId, utilisateurConnecte.id),
    chargerSessionAssistant(
      sessionAssistantRepository,
      messageAssistantRepository,
      utilisateurConnecte.entrepriseId,
      utilisateurConnecte.id,
      sessionId,
    ).catch((error) => {
      if (error instanceof SessionAssistantIntrouvableError) {
        return null;
      }
      throw error;
    }),
  ]);

  if (!sessionChargee) {
    redirect("/assistant");
  }

  return (
    <main className="px-5 py-6 sm:px-8">
      <div className="flex h-[calc(100vh-140px)] w-full flex-col">
        <AssistantChat
          entrepriseId={utilisateurConnecte.entrepriseId}
          utilisateurId={utilisateurConnecte.id}
          sessions={sessions}
          sessionActive={sessionChargee.session}
          messagesInitiaux={sessionChargee.messages}
        />
      </div>
    </main>
  );
}
