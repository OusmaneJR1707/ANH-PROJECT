"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const refreshIntervalRef = useRef(null);

  const params = useParams();
  const tenant = params?.tenant;

  const refreshSession = async () => {
    if (!tenant) {
      return null;
    }

    try {
      const apiUrl = '/api-backend';
      const res = await fetch(`${apiUrl}/auth/refresh`, {
        method: "POST",
        headers: { "X-Tenant": tenant },
        credentials: "include", // Fondamentale: invia il cookie HttpOnly a PHP
      });

      if (res.ok) {
        const result = await res.json();
        setAccessToken(result.data.access_token);
        setUser(result.data.user);
        return result.data.access_token;
      } else {
        // Se il refresh fallisce (es. sessione scaduta), puliamo lo stato
        setAccessToken(null);
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error("Errore durante il refresh del token:", error);
      setAccessToken(null);
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    if (!tenant) {
      setIsInitializing(false);
      return;
    }

    // Refresh iniziale
    const initializeSession = async () => {
      try {
        const token = await refreshSession();
        
        // Imposta il timer per rinnovare il token ogni 14 minuti (prima che scada ai 15)
        if (token && !refreshIntervalRef.current) {
          refreshIntervalRef.current = setInterval(() => {
            refreshSession();
          }, 14 * 60 * 1000);
        }
      } catch (error) {
        console.error("Errore inizializzazione:", error);
      } finally {
        // IMPORTANTE: Esce da initializing anche se il refresh fallisce
        setIsInitializing(false);
      }
    };

    initializeSession();

    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [tenant]);

  // Funzione helper per il Login
  const login = (token, userData) => {
    setAccessToken(token);
    setUser(userData);
  };

  // Funzione helper per il Logout
  const logout = async () => {
    try {
      const apiUrl = '/api-backend';
      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        headers: { 
          "X-Tenant": tenant
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Errore durante il logout:", error);
    } finally {
      setAccessToken(null);
      setUser(null);
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);