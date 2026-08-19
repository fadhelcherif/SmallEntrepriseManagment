import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="shadow-card rounded-3xl bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="mb-2 block h-[3px] w-8 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
          <h1 className="font-heading text-2xl font-bold tracking-tight text-stone-900">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{description}</p> : null}
        </div>

        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
