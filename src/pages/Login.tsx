
import { useState, type FormEvent } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../services/firebase";

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await updateProfile(result.user, {
          displayName: `${firstName} ${secondName}`,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Google login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin((previous) => !previous);
    setError("");
    setEmail("");
    setPassword("");
    setFirstName("");
    setSecondName("");
  };

  const inputClassName =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text placeholder:text-second/60 outline-none transition focus:border-main focus:ring-4 focus:ring-main/15 disabled:opacity-60";

  return (
    <section className="relative flex min-h-full items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6 lg:py-16">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-main/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-2xl shadow-black/20 sm:p-9">
          <div className="mb-8 text-center">
            <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-main/30 bg-main/10 text-2xl font-bold text-blue-300 shadow-lg shadow-main/10">
              {isLogin ? "↗" : "+"}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {isLogin ? "Welcome back" : "Create an account"}
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-second">
              {isLogin
                ? "Sign in to manage your room reservations."
                : "Register to start booking meeting rooms."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-semibold text-text"
                  >
                    First Name
                  </label>

                  <input
                    id="fisrtName"
                    type="name"
                    autoComplete="name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jhon"
                    required
                    disabled={loading}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-text"
                  >
                    Second Name
                  </label>

                  <input
                    id="secondName"
                    type="name"
                    autoComplete="name"
                    value={secondName}
                    onChange={(e) => setSecondName(e.target.value)}
                    placeholder="Jackson"
                    required
                    disabled={loading}
                    className={inputClassName}
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-text"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-text"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete={
                  isLogin ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className={inputClassName}
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-main px-4 py-3 font-semibold text-white shadow-lg shadow-main/15 transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-wider text-second">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-text transition hover:border-main/50 hover:bg-main/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main disabled:cursor-not-allowed disabled:opacity-60"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              className="h-5 w-5"
            />
            Continue with Google
          </button>

          <p className="mt-7 text-center text-sm text-second">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              disabled={loading}
              className="font-semibold text-extra underline-offset-4 transition hover:text-orange-300 hover:underline disabled:opacity-60"
            >
              {isLogin ? "Register" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-second/80">
          Secure authentication for your meeting room workspace.
        </p>
      </div>
    </section>
  );
}
