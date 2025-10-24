import { useCallback } from "react";

import Home from "./components/Home";
import { Login } from "./components/Login";
import type { ColorScheme } from "./hooks/useColorScheme";
import { useColorScheme } from "./hooks/useColorScheme";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function AppContent() {
  const { scheme, setScheme } = useColorScheme();
  const { user, loading } = useAuth();

  const handleThemeChange = useCallback(
    (value: ColorScheme) => {
      setScheme(value);
    },
    [setScheme],
  );

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400"></div>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login />;
  }

  // Show main app if authenticated
  return <Home scheme={scheme} onThemeChange={handleThemeChange} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

