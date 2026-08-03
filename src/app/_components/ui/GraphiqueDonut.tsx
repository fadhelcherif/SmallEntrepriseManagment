export type SegmentDonut = {
  label: string;
  valeur: number;
  affichage: string;
  couleur: string;
};

type GraphiqueDonutProps = {
  segments: SegmentDonut[];
  centreLabel: string;
  centreValeur: string;
  centreCouleur?: string;
};

const RAYON = 60;
const EPAISSEUR = 22;
const CIRCONFERENCE = 2 * Math.PI * RAYON;

export function GraphiqueDonut({ segments, centreLabel, centreValeur, centreCouleur = "var(--color-foreground)" }: GraphiqueDonutProps) {
  const total = segments.reduce((somme, segment) => somme + Math.max(0, segment.valeur), 0);

  let cumul = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative h-48 w-48 shrink-0">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle cx="80" cy="80" r={RAYON} fill="none" stroke="#f1f5f4" strokeWidth={EPAISSEUR} />
          {total > 0
            ? segments.map((segment) => {
                const part = Math.max(0, segment.valeur) / total;
                const longueur = part * CIRCONFERENCE;
                const cercle = (
                  <circle
                    key={segment.label}
                    cx="80"
                    cy="80"
                    r={RAYON}
                    fill="none"
                    stroke={segment.couleur}
                    strokeWidth={EPAISSEUR}
                    strokeDasharray={`${longueur} ${CIRCONFERENCE - longueur}`}
                    strokeDashoffset={-cumul}
                    strokeLinecap={segments.length > 1 ? "butt" : "round"}
                  />
                );
                cumul += longueur;
                return cercle;
              })
            : null}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-medium tracking-wide text-stone-500 uppercase">{centreLabel}</span>
          <span className="font-heading text-xl font-semibold" style={{ color: centreCouleur }}>
            {centreValeur}
          </span>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-3">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2 font-medium text-stone-700">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: segment.couleur }} />
              {segment.label}
            </span>
            <span className="font-heading font-semibold text-stone-900">{segment.affichage}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
