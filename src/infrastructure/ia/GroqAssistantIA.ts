import type { AssistantIA, TourConversation } from "../../domain/services/AssistantIA";

const MODELE = "llama-3.3-70b-versatile";

function cleApiGroq(): string {
  const cle = process.env.GROQ_API_KEY;

  if (!cle) {
    throw new Error("GROQ_API_KEY n'est pas défini.");
  }

  return cle;
}

export class GroqAssistantIA implements AssistantIA {
  async repondre(historique: TourConversation[], question: string, contexte: string): Promise<string> {
    const messagesHistorique = historique.map((tour) => ({
      role: tour.role === "UTILISATEUR" ? ("user" as const) : ("assistant" as const),
      content: tour.contenu,
    }));

    const reponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleApiGroq()}`,
      },
      body: JSON.stringify({
        model: MODELE,
        messages: [
          {
            role: "system",
            content:
              "Tu es un conseiller business expérimenté, intégré à Vantik (application de gestion pour petites " +
              "entreprises). Tu n'es pas un simple lecteur de chiffres : tu analyses les données ci-dessous en " +
              "profondeur avant de répondre.\n\n" +
              "Démarche à suivre à chaque réponse :\n" +
              "1. Repère les tendances dans l'évolution mensuelle (croissance, stagnation, déclin — sur les ventes " +
              "ET sur les achats), les écarts entre marge et prix de vente produit par produit, les produits à " +
              "faible marge ou à rotation lente, les fournisseurs ou catégories sur- ou sous-représentés, et tout " +
              "chiffre incohérent ou anormal (pic, chute, taux d'annulation élevé, stock qui ne bouge jamais...).\n" +
              "2. Ne te contente jamais de reformuler les chiffres fournis : déduis-en ce qu'ils signifient pour " +
              "l'activité, et pourquoi.\n" +
              "3. Termine toujours par au moins une recommandation concrète et actionnable (ex : quel produit " +
              "pousser, quel prix ajuster, quel stock réapprovisionner, quelle charge questionner) — jamais un " +
              "conseil générique ('vendez plus', 'réduisez les coûts') sans lien avec les données précises fournies.\n" +
              "4. Si une anomalie ou un risque saute aux yeux dans les données (même si la question ne porte pas " +
              "dessus), signale-le brièvement avant de répondre à la question posée.\n" +
              "5. Si on te demande de classer, comparer ou désigner le meilleur/pire élément (produit, fournisseur, " +
              "mois...), tranche avec les données fournies (marge, ventes totales, montant acheté, tendance...) " +
              "au lieu d'esquiver — les listes de produits et de fournisseurs sont déjà triées de la meilleure " +
              "performance à la moins bonne, donc le dernier élément d'une liste en est le moins performant.\n\n" +
              "Réponds en français, de façon directe et structurée (phrases courtes ou puces), sans blabla " +
              "d'introduction. Base-toi uniquement sur les données ci-dessous, n'invente aucun chiffre.\n\n" +
              `Données de l'entreprise :\n${contexte}`,
          },
          ...messagesHistorique,
          { role: "user", content: question },
        ],
        temperature: 0.5,
      }),
    });

    if (!reponse.ok) {
      throw new Error(`Appel Groq échoué (${reponse.status}) : ${await reponse.text()}`);
    }

    const donnees = await reponse.json();
    const texte = donnees.choices?.[0]?.message?.content;

    if (typeof texte !== "string") {
      throw new Error("Réponse Groq invalide.");
    }

    return texte;
  }
}
