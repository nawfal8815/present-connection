
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User, signOut } from "firebase/auth";
import { auth } from "./services/firebase";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-text">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-extra" />
            <p className="text-sm text-second">
              Checking authentication...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-text">
        <Navbar />
        <main className="flex-1">
          <Login />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <Navbar isLoggedIn onLogout={handleLogout} />

      <main className="flex-1">
        <Dashboard
          userEmail={user.email}
          onLogout={handleLogout}
        />
      </main>

      <Footer />
    </div>
  );
}

export default App;
