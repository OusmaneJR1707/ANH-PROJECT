import React from 'react';

export default function Features() {
    const features = [
        {
            title: "Diagrammi di Gantt Avanzati",
            description: "Visualizza e gestisce le timeline dei progetti con diagrammi interattivi e calcolo automatico del percorso critico",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        }, 
        { 
            title: 'Gestione Team Completa', 
            description: 'Organizza capigruppo e membri di progetto, assegna ruoli e monitora le performance di ogni dipendente.', 
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ) 
        },
        { 
            title: 'Report Dettagliati', 
            description: 'Genera report generali, di team e personali per una visione chiara dell\'andamento dei progetti e dei lavoratori.', 
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ) 
        },
        { 
            title: 'Comunicazione Integrata', 
            description: 'Sistema di messaggistica interno e gestione segnalazioni per mantenere il team sempre connesso.', 
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ) 
        },
        { 
            title: 'Verifica P.IVA Automatica', 
            description: 'Sistema di registrazione sicuro con verifica automatica della partita IVA per garantire solo aziende reali.', 
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ) 
        },
        { 
            title: 'Personalizzazione Totale', 
            description: 'Adatta la grafica dell\'applicazione al tuo brand aziendale per un\'esperienza completamente personalizzata.', 
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ) 
        }
    ]; 

    return (
        <section id="funzionalita" className="py-24 bg-gray-50 dark:bg-[#0a0f1a] transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Intestazione sezione */}
                <div className="text-center mb-16 sm:mb-20">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                        Tutto ciò di cui hai bisogno per gestire i tuoi progetti
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                        Una piattaforma completa che integra pianificazione, gestione team e reportistica avanzata
                    </p>
                </div>

                {/* Griglia funzionalità */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <div 
                            key={index} 
                            className="group bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-gray-800 p-8 rounded-2xl flex flex-col gap-5 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-lg dark:hover:shadow-blue-900/10 transition-all duration-300"
                        >
                            {/* Contenitore Icona */}
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            
                            {/* Testi */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}