import React, { Suspense } from 'react';
import RegisterForm from '../../components/register/RegisterForm';

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0f1a] py-12 px-4 transition-colors duration-300 relative overflow-hidden">
            
            {/* Decorazioni Sfondo */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-green-500/10 blur-3xl pointer-events-none"></div>

            <Suspense fallback={
                <div className="flex flex-col items-center justify-center space-y-4 z-10 relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Inizializzazione in corso...</p>
                </div>
            }>
                <RegisterForm />
            </Suspense>
        </div>
    );
}