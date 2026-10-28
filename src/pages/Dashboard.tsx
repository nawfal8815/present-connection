
import RoomList from "../components/Rooms";
import {Admin} from "./Admin";

interface DashboardProps {
  userEmail: string | null;
  onLogout: () => void;
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL
  ?.trim()
  .toLowerCase();

export function Dashboard({ userEmail }: DashboardProps) {
  const isAdmin =
    !!userEmail &&
    !!ADMIN_EMAIL &&
    userEmail.trim().toLowerCase() === ADMIN_EMAIL;

  if (isAdmin) {
    return (
      <main className="min-h-full bg-background px-6 py-10 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-8 shadow-xl shadow-black/10 md:p-10">
            <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-violet/10 blur-3xl" />

            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-extra" />
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet">
                  Administration
                </p>
              </div>

              <h1 className="text-3xl mb-4 font-bold tracking-tight text-text md:text-4xl">
                Admin dashboard
              </h1>

              <Admin />

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-xl border border-border bg-background/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-second">
                    Access level
                  </p>
                  <p className="mt-1 font-semibold text-success">
                    Administrator
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-background/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-second">
                    Account
                  </p>
                  <p className="mt-1 max-w-xs break-all font-medium text-text">
                    {userEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <RoomList />;
}
