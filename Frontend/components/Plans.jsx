import React from 'react';
import Link from 'next/link';

export default function Plans({ initialPlans }) {
  // Gestione caso in cui l'API non restituisca piani o ci sia un errore
  if (!initialPlans || initialPlans.length === 0) {
    return (
      <section id="piani" className="py-24 bg-white dark:bg-[#0a0f1a] border-t border-gray-100 dark:border-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">Nessun piano disponibile al momento.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="piani" className="py-24 bg-white dark:bg-[#0a0f1a] border-t border-gray-100 dark:border-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intestazione */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            Piani su misura per ogni azienda
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Scegli il piano più adatto alle tue esigenze.
          </p>
        </div>

        {/* Griglia dei Piani */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          {initialPlans.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative bg-gray-50 dark:bg-[#0f1623] border ${
                plan.popular 
                  ? 'border-blue-500 shadow-xl shadow-blue-500/10 scale-100 lg:scale-105 z-10' 
                  : 'border-gray-200 dark:border-gray-800'
              } p-8 rounded-3xl flex flex-col gap-8 transition-all duration-300`}
            >
              {/* Badge Più Popolare */}
              {plan.popular && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                  ☆ Più Popolare
                </div>
              )}
              
              {/* Nome Piano */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
              </div>
              
              {/* Prezzo: dividiamo la stringa "€29,90/mese" per fare il mese più piccolo */}
              <div className="flex items-baseline gap-1 -mt-4">
                <span className="text-5xl font-extrabold text-gray-900 dark:text-white">{plan.price.split('/')[0]}</span>
                <span className="text-gray-500 dark:text-gray-400 font-medium">/mese</span>
              </div>

              {/* Lista delle Caratteristiche */}
              <ul className="text-base text-gray-600 dark:text-gray-300 space-y-4 grow">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>

              {/* Call to Action */}
              <Link 
                href="/register" 
                className={`w-full text-center text-base font-semibold px-6 py-4 rounded-xl transition-all ${
                  plan.popular 
                    ? 'text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20' 
                    : 'text-gray-900 dark:text-white bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                Inizia ora
              </Link>
            </div>
          ))}
        </div>

        {/* Pulsante "Confronta tutti i piani" */}
        <div className="mt-16 flex justify-center">
          <Link 
            href="/piani" 
            className="inline-flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Confronta tutti i piani e i dettagli
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}