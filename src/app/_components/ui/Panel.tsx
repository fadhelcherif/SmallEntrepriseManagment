import type { ReactNode } from "react";

type PanelProps = {
  id?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Panel({ id, title, description, actions, children, className = "" }: PanelProps) {
  return (
    <section id={id} className={`shadow-card rounded-3xl bg-white p-6 ${className}`}>
      {title ? (
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-stone-900">{title}</h2>
            {description ? <p className="mt-1 text-sm text-stone-500">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}
