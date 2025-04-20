import { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  setAuthStatus: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication status on first load
  useEffect(() => {
    const tokenExists = document.cookie.includes("access_token");
    setIsAuthenticated(tokenExists);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthStatus: setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication state
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
