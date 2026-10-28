
export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-6 py-5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 text-center">
        <span className="text-sm text-second">
          © {new Date().getFullYear()} Present Connection.
        </span>
        <span className="hidden h-1 w-1 rounded-full bg-extra sm:block" />
        <span className="text-sm text-second/70">
          All rights reserved.
        </span>
      </div>
    </footer>
  );
}
