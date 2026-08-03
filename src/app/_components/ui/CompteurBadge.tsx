type CompteurBadgeProps = {
  nombre: number;
};

export function CompteurBadge({ nombre }: CompteurBadgeProps) {
  if (nombre <= 0) {
    return null;
  }

  return (
    <span
      className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold"
      style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
    >
      {nombre > 99 ? "99+" : nombre}
    </span>
  );
}
