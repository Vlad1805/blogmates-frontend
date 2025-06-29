import { UserDataResponse, getUserData, refreshToken } from "@/api/blogmates-backend";
import { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  userData: UserDataResponse | null;
  setAuthStatus: (status: boolean) => void;
  setUserData: (userData: UserDataResponse) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserDataResponse | null>(null);

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Attempt to refresh the token
        await refreshToken();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        setUserData(null);
      }
    };

    checkAuth();
  }, []);

  // Fetch user data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getUserData()
        .then(data => {
          setUserData(data);
        })
        .catch(error => {
          console.error("Failed to fetch user data:", error);
          setIsAuthenticated(false);
          setUserData(null);
        });
    } else {
      setUserData(null);
    }
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData, setAuthStatus: setIsAuthenticated, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
