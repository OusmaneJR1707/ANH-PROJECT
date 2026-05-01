'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkMode ? 'dark' : 'light';
        setIsDarkMode(!isDarkMode);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        window.localStorage.setItem('theme', newTheme);
    };

    const navLinks = [
        { name: 'Funzionalità', href: '/#funzionalita' },
        { name: 'Piani', href: '/#piani' },
        { name: 'Demo', href: '/#demo' },
        { name: 'Contatti', href: '/#contatti' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0f1a]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <div className="shrink-0">
                        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                        <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 10h3v10H4zM10 4h3v16h-3zM16 14h3v6h-3z" />
                            </svg>
                        </div>
                        ANH-Project
                        </Link>
                    </div>

                    {/* Navigazione Desktop */}
                    <nav className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    {/* Azioni Desktop */}
                    <div className="hidden md:flex items-center space-x-4">
                        
                        {/* Pulsante tema */}
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                                aria-label="Cambia tema"
                            >
                                {isDarkMode ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>
                        )}

                        <Link 
                            href="/login" 
                            className="text-sm font-medium text-black bg-white border border-black px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            Accedi
                        </Link>

                        <Link href="/register" className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">
                            Registrati
                        </Link>
                    </div>

                    {/* Pulsante Menu Mobile */}
                    <div className="md:hidden flex items-center space-x-4">
                        {mounted && (
                            <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400">
                                {isDarkMode ? '☀️' : '🌙'}
                            </button>
                        )}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Menu a tendina Mobile */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-[#0a0f1a] border-b border-gray-200 dark:border-gray-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                           <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                            >
                                {link.name}
                            </a> 
                        ))}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 px-3 space-y-2">
                            <Link href="/login" className="block text-center text-base font-medium text-black bg-white border border-black px-4 py-2 rounded-full">
                                Accedi
                            </Link>

                            <Link href="/register" className="block text-center mt-2 text-base font-medium text-white bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-700">
                                Registrati
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
} 