
interface NavbarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export function Navbar({
  isLoggedIn = false,
  onLogout,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 px-6 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div
          aria-label="Logo placeholder"
          className="h-10 w-32 rounded-lg border-2 border-dashed border-border bg-surface"
        />

        <div className="flex items-center gap-3">
          {isLoggedIn && (
            <>
              <span className="hidden items-center gap-2 text-xs text-second sm:inline-flex">
                <span className="h-2 w-2 rounded-full bg-success" />
                Signed in
              </span>

              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text transition hover:border-extra/50 hover:text-orange-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
