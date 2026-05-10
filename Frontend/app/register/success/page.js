'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, Suspense } from 'react';
import { toast } from 'sonner';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (sessionId) {
            toast.success("Pagamento elaborato con successo!");
        }
    }, [sessionId]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#080c14] p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#0f1623] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl text-center relative z-10">*
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Pagamento Ricevuto!
                </h1>
                
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    Stiamo costruendo il tuo spazio di lavoro. L'operazione richiede qualche secondo.
                    <br/><br/>
                    Non appena i nostri server avranno finito, <strong className="text-gray-900 dark:text-white">riceverai un'email</strong> all'indirizzo che hai indicato, contenente il link per accedere al tuo nuovo workspace.
                </p>
                
                <Link 
                    href="/" 
                    className="inline-block w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                >
                    Torna alla Home
                </Link>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-[#080c14] flex items-center justify-center">Caricamento...</div>}>
            <SuccessContent />
        </Suspense>
    );
}