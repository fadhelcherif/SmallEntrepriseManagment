"use client";

import { useActionState, useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, MessageSquarePlus, Send, Sparkles, Trash2 } from "lucide-react";

import type { MessageAssistant } from "../../../domain/entities/MessageAssistant";
import type { SessionAssistant } from "../../../domain/entities/SessionAssistant";
import { poserQuestionAction, supprimerSessionAction, type AssistantState } from "./actions";

type MessageAffiche = {
  role: "UTILISATEUR" | "ASSISTANT" | "ERREUR";
  contenu: string;
};

type AssistantChatProps = {
  entrepriseId: string;
  utilisateurId: string;
  sessions: SessionAssistant[];
  sessionActive: SessionAssistant | null;
  messagesInitiaux: MessageAssistant[];
};

const etatInitial: AssistantState = {};

const SUGGESTIONS = [
  "Comment améliorer mes ventes ce mois-ci ?",
  "Y a-t-il des anomalies dans mon activité ?",
  "Quels produits devrais-je pousser ?",
];

function debutJour(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formaterDateRelative(date: Date): string {
  const jours = Math.round((debutJour(new Date()).getTime() - debutJour(date).getTime()) / 86_400_000);

  if (jours <= 0) return "Aujourd'hui";
  if (jours === 1) return "Hier";
  if (jours < 7) return `Il y a ${jours} jours`;

  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
}

export function AssistantChat({ entrepriseId, utilisateurId, sessions, sessionActive, messagesInitiaux }: AssistantChatProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(poserQuestionAction, etatInitial);
  const [messages, setMessages] = useState<MessageAffiche[]>(() =>
    messagesInitiaux.map((message) => ({ role: message.role, contenu: message.contenu })),
  );
  const [sessionIdActif, setSessionIdActif] = useState<string | null>(sessionActive?.id ?? null);
  const [valeurQuestion, setValeurQuestion] = useState("");
  const dernierTraite = useRef<AssistantState | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const zoneMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state !== dernierTraite.current && state.question && (state.reponse || state.erreur)) {
      dernierTraite.current = state;
      setMessages((current) => [
        ...current,
        { role: "UTILISATEUR", contenu: state.question ?? "" },
        { role: state.erreur ? "ERREUR" : "ASSISTANT", contenu: state.reponse ?? state.erreur ?? "" },
      ]);
      setValeurQuestion("");

      if (state.sessionId && state.sessionId !== sessionIdActif) {
        setSessionIdActif(state.sessionId);
        router.replace(`/assistant/${state.sessionId}`, { scroll: false });
      }
    }
  }, [state, router, sessionIdActif]);

  useEffect(() => {
    zoneMessagesRef.current?.scrollTo({ top: zoneMessagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isPending]);

  function surAppuiTouche(evenement: KeyboardEvent<HTMLTextAreaElement>) {
    if (evenement.key === "Enter" && !evenement.shiftKey) {
      evenement.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <div className="shadow-card flex h-full min-h-0 overflow-hidden rounded-3xl bg-white">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-100 bg-stone-50/60 p-4 md:flex">
        <Link
          href="/assistant"
          className="mb-3 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <MessageSquarePlus className="h-4 w-4" strokeWidth={1.75} />
          Nouvelle conversation
        </Link>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {sessions.length === 0 ? (
            <p className="px-3 py-2 text-xs text-stone-400">Aucune conversation pour l&apos;instant.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {sessions.map((session) => {
                const estActive = session.id === sessionIdActif;

                return (
                  <div key={session.id} className="group relative">
                    <Link
                      href={`/assistant/${session.id}`}
                      className={`block rounded-2xl px-3 py-2.5 pr-8 transition ${estActive ? "font-semibold text-white" : "text-stone-600 hover:bg-white"}`}
                      style={estActive ? { backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" } : undefined}
                    >
                      <p className="truncate text-sm">{session.titre}</p>
                      <p className={`text-[11px] ${estActive ? "text-white/70" : "text-stone-400"}`}>
                        {formaterDateRelative(session.derniereActivite)}
                      </p>
                    </Link>
                    <form
                      action={supprimerSessionAction.bind(null, entrepriseId, utilisateurId, session.id)}
                      className="absolute top-1/2 right-1 -translate-y-1/2 opacity-0 transition group-hover:opacity-100"
                    >
                      <button
                        type="submit"
                        aria-label="Supprimer la conversation"
                        title="Supprimer la conversation"
                        className={`flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-red-50 hover:text-red-600 ${estActive ? "text-white/70" : "text-stone-400"}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col p-6">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
          >
            <Sparkles className="h-4.5 w-4.5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-heading text-base font-bold text-stone-900">{sessionActive?.titre ?? "Assistant Vantik"}</p>
            <p className="text-xs text-stone-500">Basé sur les données réelles de ton entreprise</p>
          </div>
        </div>

        <div ref={zoneMessagesRef} className="min-h-0 flex-1 overflow-y-auto py-6">
          <div className="mx-auto flex w-full max-w-2xl flex-col">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, white)", color: "var(--color-primary)" }}
                >
                  <Bot className="h-7 w-7" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-stone-900">Pose ta première question</p>
                  <p className="mt-1 text-sm text-stone-500">Conseils, analyse de tendances, anomalies détectées.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setValeurQuestion(suggestion)}
                      className="rounded-full border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-stone-900 hover:text-stone-900"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {messages.map((message, index) =>
                  message.role === "UTILISATEUR" ? (
                    <div key={index} className="flex justify-end">
                      <p
                        className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm"
                        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
                      >
                        {message.contenu}
                      </p>
                    </div>
                  ) : (
                    <div key={index} className="flex items-start gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                        <Bot className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <p
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                          message.role === "ERREUR" ? "bg-red-50 text-red-700" : "bg-stone-100 text-stone-800"
                        }`}
                      >
                        {message.contenu}
                      </p>
                    </div>
                  ),
                )}
                {isPending ? (
                  <div className="flex items-start gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                      <Bot className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <p className="rounded-2xl bg-stone-100 px-4 py-2.5 text-sm text-stone-400">En train de réfléchir...</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <form ref={formRef} action={formAction} className="mx-auto flex w-full max-w-2xl items-end gap-2 pt-2">
          <input type="hidden" name="sessionId" value={sessionIdActif ?? ""} />
          <textarea
            name="question"
            required
            rows={1}
            value={valeurQuestion}
            onChange={(evenement) => setValeurQuestion(evenement.target.value)}
            onKeyDown={surAppuiTouche}
            className="min-h-11 flex-1 resize-none rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
            placeholder="Écris ta question... (Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne)"
          />
          <button
            type="submit"
            disabled={isPending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <Send className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </form>
      </div>
    </div>
  );
}
