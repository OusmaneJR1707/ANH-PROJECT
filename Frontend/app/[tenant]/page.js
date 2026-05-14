"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function TenantDashboard() {
  const { user, isInitializing, logout } = useAuth();
  const router = useRouter();

  if (isInitializing || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#080c14]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    toast.info("Disconnessione effettuata");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080c14] p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Benvenuto, {user.first_name}!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {user.email}
            </p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors font-medium text-sm"
          >
            Disconnetti
          </button>
        </div>
      </div>
    </div>
  );
}