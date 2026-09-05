import { createContext, useContext, useState, useCallback } from "react";
import { loginApi } from "../services/api";

export const TOKEN_STORAGE_KEY = "token";
export const USER_STORAGE_KEY = "user";

export const AuthContext = createContext(null);
//Funcion helper para usuario almacenado al iniciar
function readStoredUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
//Gestion de sesion, persistencia y llamadas a API de autenticacion.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_STORAGE_KEY) || null,
  );
  //Guarda los datos en el localStorage
  const persistSession = (authResponse) => {
    const sessionUser = {
      id: authResponse.userId,
      email: authResponse.email,
      role: authResponse.role,
    };

    localStorage.setItem(TOKEN_STORAGE_KEY, authResponse.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));

    setToken(authResponse.token);
    setUser(sessionUser);
  };
  //Funcion de Login
  const login = useCallback(async (credentials) => {
    const data = await loginApi(credentials);
    persistSession(data);
    return data;
  }, []);
  //Funcion de Logout
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
