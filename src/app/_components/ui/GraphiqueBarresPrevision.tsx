export type PointCourbePrevision = {
  libelle: string;
  valeur: number;
  estPrevision: boolean;
  basse?: number;
  haute?: number;
};

type GraphiqueBarresPrevisionProps = {
  points: PointCourbePrevision[];
  hauteur?: number;
};

export function GraphiqueBarresPrevision({ points, hauteur = 180 }: GraphiqueBarresPrevisionProps) {
  const maxValeur = Math.max(...points.map((point) => point.haute ?? point.valeur), 1);

  return (
    <div className="flex items-stretch gap-3" style={{ height: hauteur }}>
      {points.map((point, index) => {
        const hauteurBarre = Math.max(2, (Math.max(0, point.valeur) / maxValeur) * 100);
        const hauteurBasse = point.basse !== undefined ? (Math.max(0, point.basse) / maxValeur) * 100 : null;
        const hauteurHaute = point.haute !== undefined ? (Math.max(0, point.haute) / maxValeur) * 100 : null;

        return (
          <div key={`${point.libelle}-${index}`} className="flex h-full flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full flex-1 items-end justify-center">
              {hauteurBasse !== null && hauteurHaute !== null ? (
                <div
                  className="absolute w-px bg-stone-400"
                  style={{ bottom: `${hauteurBasse}%`, height: `${Math.max(0, hauteurHaute - hauteurBasse)}%` }}
                />
              ) : null}
              <div
                className="w-full max-w-10 rounded-t-md"
                style={{
                  height: `${hauteurBarre}%`,
                  backgroundColor: point.estPrevision ? "color-mix(in srgb, var(--color-primary) 30%, white)" : "var(--color-primary)",
                  border: point.estPrevision ? "1.5px dashed var(--color-primary)" : "none",
                }}
                title={point.valeur.toFixed(2)}
              />
            </div>
            <span className="text-center text-[10px] leading-tight font-medium text-stone-500">{point.libelle}</span>
            <span className="text-center text-xs font-semibold text-stone-900">{point.valeur.toFixed(0)}</span>
          </div>
        );
      })}
    </div>
  );
}
