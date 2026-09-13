import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-end sm:justify-between md:mb-6">
      <div className="min-w-0">
        <h1 className="break-words text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="min-w-0 [&>*]:w-full sm:[&>*]:w-auto">{action}</div>}
    </div>
  );
}
