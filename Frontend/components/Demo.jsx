import React from 'react';
import Link from 'next/link';

export default function Demo() {
  return (
    <section id="demo" className="py-24 bg-blue-600 dark:bg-blue-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight">
          Pronto a trasformare la gestione dei tuoi progetti?
        </h2>
        
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Prenota una demo gratuita con i nostri esperti. Ti mostreremo come l'architettura su misura del nostro sistema può adattarsi perfettamente al flusso di lavoro della tua azienda.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link 
            href="/register" 
            className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 text-base font-bold rounded-xl text-blue-600 bg-white hover:bg-gray-50 transition-colors shadow-lg"
          >
            Inizia la prova gratuita
          </Link>
          
          <Link 
            href="#contatti" 
            className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 text-base font-bold rounded-xl text-white border-2 border-white/30 hover:bg-white/10 transition-colors"
          >
            Contatta le vendite
          </Link>
        </div>
        
      </div>
    </section>
  );
}