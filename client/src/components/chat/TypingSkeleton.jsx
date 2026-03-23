export const TypingSkeleton = () => (
  <div className="flex max-w-3xl gap-3 rounded-3xl rounded-bl-md bg-white/80 px-4 py-4 shadow-sm dark:bg-slate-900/80">
    <div className="h-10 w-10 shrink-0 animate-pulse rounded-2xl bg-emerald-200/70 dark:bg-emerald-900/60" />
    <div className="flex flex-1 flex-col gap-2">
      <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="h-3 w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
    </div>
  </div>
)
