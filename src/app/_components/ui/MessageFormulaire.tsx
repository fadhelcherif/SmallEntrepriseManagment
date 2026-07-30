import { CheckCircle2, XCircle } from "lucide-react";

type MessageFormulaireProps = {
  message?: string;
  success?: boolean;
};

export function MessageFormulaire({ message, success }: MessageFormulaireProps) {
  if (!message) {
    return null;
  }

  const Icon = success ? CheckCircle2 : XCircle;

  return (
    <p
      className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
        success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span>{message}</span>
    </p>
  );
}
