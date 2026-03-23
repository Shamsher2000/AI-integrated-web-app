// The shell keeps the control hub fixed on the left and the active page content on the right.
export const AppShell = ({ sidebar, children }) => (
  <div className="mx-auto flex h-screen max-w-[1600px] gap-4 overflow-hidden px-4 py-4 bg-(--bg)">
    <aside className="hidden h-full w-80 shrink-0 lg:block">{sidebar}</aside>
    <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
  </div>
)
