"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Script from "next/script";

export default function TenantLogin({ params }) {
  const resolvedParams = use(params);
  const tenant = resolvedParams.tenant;
  
  const router = useRouter();
  const { accessToken, user, login, isInitializing } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // LOGIN STANDARD
  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = '/api-backend';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Tenant": tenant
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Accesso effettuato!");
        login(result.data.access_token, result.data.user);
        router.push(`/`);
      } else {
        toast.error(result.message || "Credenziali errate");
      }
    } catch (error) {
      toast.error("Errore di connessione al server");
    } finally {
      setIsLoading(false);
    }
  };

  // LOGIN GOOGLE
  const handleGoogleCallback = async (response) => {
    setIsLoading(true);
    try {
      const apiUrl = '/api-backend';
      const res = await fetch(`${apiUrl}/auth/login/google`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Tenant": tenant
        },
        body: JSON.stringify({ google_token: response.credential }),
        credentials: "include",
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Accesso effettuato con Google!");
        login(result.data.access_token, result.data.user);
        router.push(`/`);
      } else {
        console.error("Google Login Error:", res.status, result);
        toast.error(result.message || `Errore: ${result.error || "Impossibile accedere con Google"}`);
      }
    } catch (error) {
      console.error("Google Login Network Error:", error);
      toast.error("Errore di connessione al server");
    } finally {
      setIsLoading(false);
    }
  };

  // Sezione di attesa mentre verifica la sessione
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#080c14]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#080c14] px-4">
      {/* Script di Google caricato in modo sicuro da Next.js */}
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive"
        onLoad={() => {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
          });
          window.google.accounts.id.renderButton(
            document.getElementById("google-button-container"),
            { theme: "outline", size: "large", width: "100%" }
          );
        }}
      />

      <div className="max-w-md w-full p-8 bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accedi</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Workspace: <span className="font-semibold text-blue-600">{tenant}</span>
          </p>
        </div>

        <form onSubmit={handleStandardLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {isLoading ? "Verifica in corso..." : "Entra nel Workspace"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-700"></span>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500 dark:bg-[#111827]">Oppure</span>
          </div>
        </div>

        {/* Contenitore per il bottone di Google */}
        <div id="google-button-container" className="w-full flex justify-center"></div>
        
      </div>
    </div>
  );
}