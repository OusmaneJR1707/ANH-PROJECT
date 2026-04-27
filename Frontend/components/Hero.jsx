import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
    const points = [
        'Nessuna carta di credito richiesta',
        'Demo completa disponibile', 
        'Supporto dedicato'
    ];

    return (
        <section id="hero" className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-64 bg-linear-to-b from-blue-900/10 to-transparent pointer-events-none" />

            <div className="relative inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-full px-4 py-1.5 mb-8">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    Sistema di gestione progetti intelligente
                </span>
            </div>

            <h1 className="relative text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6 tracking-tight">
                Gestisci i tuoi progetti <br className="hidden sm:block" />
                con i <span className="text-blue-600 dark:text-blue-500">diagrammi di Gantt</span>
            </h1>

            <p className="relative max-w-3xl text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                ANH-Project semplifica la suddivisione delle attività tra dipendenti, con report dettagliati e una gestione completa dei progetti aziendali.
            </p>

            <div className="relative flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
                <Link 
                href="/register" 
                className="w-full sm:w-auto text-base font-semibold text-white bg-blue-600 px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                Inizia gratis
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                </Link>
                
                <Link 
                href="#demo" 
                className="w-full sm:w-auto text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-[#0a0f1a] px-8 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Guarda la demo
                </Link>
            </div>

            <div className="relative flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-gray-600 dark:text-gray-400 mb-20">
                {points.map((point) => (
                <div key={point} className="flex items-center gap-2">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    {point}
                </div>
                ))}
            </div>

            <div className="relative w-full max-w-5xl mx-auto">
                {/* Bagliore blu dietro lo schermo */}
                <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-600/20 blur-[100px] rounded-full" />
                
                    <div className="relative bg-gray-100 dark:bg-[#0f1623] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
                    <Image 
                        src="/images/dashboard-mockup.png" 
                        alt="Screenshot del Diagramma di Gantt di ANH-Project"
                        width={1200}
                        height={750}
                        className="w-full h-auto rounded-xl object-contain shadow-inner"
                        priority
                    />
                    </div>
                </div>
        </section>
    )
}