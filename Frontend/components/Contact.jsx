'use client'

import React, { useState } from 'react';

export default function Contact() {
    
    // Stati per i valori, gli errori e i campi "toccati"
    const [formData, setFormData] = useState({ company: '', email: '', phone: '', message: ''});
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateField = (id, value) => {
        let error = '';

        switch (id) {
            case 'company':
                if(!value.trim()) {
                    error = "Il nome dell'azienda è obbligatorio";
                }
                break;
            case 'email': 
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value.trim()) {
                    error = 'L\'email è obbligatoria';
                } else if (!emailRegex.test(value)) {
                    error = 'Inserisci un indirizzo email valido (es. nome@azienda.it)';
                }
                break;
            case 'phone':
                // Accetta numeri, spazi, trattini e il + iniziale. Almeno 5 cifre.
                const phoneRegex = /^(\+?\d{1,4}[\s-]?)?\d{5,15}$/;
                if (value.trim() && !phoneRegex.test(value.replace(/[\s-]/g, ''))) {
                    error = 'Inserisci un numero di telefono valido';
                }
                break;
            case 'message':
                if (!value.trim()) {
                    error = 'Il messaggio è obbligatorio';
                } else if (value.trim().length < 10) {
                    error = 'Il messaggio deve contenere almeno 10 caratteri';
                }
                break;
            default:
                break;
        }

        setErrors((prev) => ({ ...prev, [id]: error}));
        return error === '';
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value}));

        if (touched[id]) {
            validateFiled(id, value);
        }
    };

    const handleBlur = (e) => {
        const { id, value } = e.target;
        setTouched((prev) => ({ ...prev, [id]: true}));
        validateField(id, value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        let isFormValid = true;
        const newTouched = { company: true, email: true, phone: true, message: true };
        setTouched(newTouched);

        Object.keys(formData).forEach((key) => {
            const isValid = validateField(key, formData[key]);
            if (!isValid) isFormValid = false;
        });

        if (isFormValid) {
            console.log('Form inviato con successo:', formData);
            // Qui farai la fetch al tuo backend PHP per inviare l'email
            // es. await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })
        }
    };

    const getInputClasses = (id) => {
        const baseClasses = "w-full bg-gray-50 dark:bg-[#0a0f1a] border rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600";
        const hasError = touched[id] && errors[id];
        
        return `${baseClasses} ${
        hasError 
            ? "border-red-500 focus:ring-2 focus:ring-red-500/50" 
            : "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        }`;
    };

    return (
        <section id="contatti" className="py-24 bg-gray-50 dark:bg-[#0a0f1a] transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
                {/* Intestazione */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                        Hai domande? Contattaci
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                        Il nostro team è pronto ad aiutarti a trovare la soluzione perfetta per la tua azienda
                    </p>
                </div>

                {/* Griglia a 2 colonne */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                
                    {/* Colonna Sinistra: Form di Contatto */}
                    <div className="bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 sm:p-10 shadow-sm transition-colors duration-300">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invia un messaggio</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Compila il form e ti risponderemo entro 24 ore</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        
                            {/* Campo: Nome azienda */}
                            <div>
                                <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nome azienda
                                </label>
                                <input
                                type="text"
                                id="company"
                                value={formData.company}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="La tua azienda"
                                className={getInputClasses('company')}
                                />
                                {touched.company && errors.company && (
                                <p className="text-red-500 text-xs mt-2 font-medium">{errors.company}</p>
                                )}
                            </div>

                            {/* Campo: Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                                </label>
                                <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="info@azienda.it"
                                className={getInputClasses('email')}
                                />
                                {touched.email && errors.email && (
                                <p className="text-red-500 text-xs mt-2 font-medium">{errors.email}</p>
                                )}
                            </div>

                            {/* Campo: Telefono */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Telefono (opzionale)
                                </label>
                                <input
                                type="tel"
                                id="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="+39 123 456 7890"
                                className={getInputClasses('phone')}
                                />
                                {touched.phone && errors.phone && (
                                <p className="text-red-500 text-xs mt-2 font-medium">{errors.phone}</p>
                                )}
                            </div>

                            {/* Campo: Messaggio */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Messaggio
                                </label>
                                <textarea
                                id="message"
                                rows="4"
                                value={formData.message}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Come possiamo aiutarti?"
                                className={`${getInputClasses('message')} resize-none`}
                                ></textarea>
                                {touched.message && errors.message && (
                                <p className="text-red-500 text-xs mt-2 font-medium">{errors.message}</p>
                                )}
                            </div>

                            {/* Pulsante Submit */}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-md shadow-blue-600/20 mt-4"
                            >
                                Invia messaggio
                            </button>
                        </form>
                    </div>

                    {/* Colonna Destra: Info Contatti (Invariata rispetto a prima) */}
                    <div className="space-y-6">
                        
                        <div className="bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex items-start gap-5 transition-colors duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Email</h4>
                                <a href="mailto:info@anh-project.it" className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">info@anh-project.it</a>
                                <a href="mailto:vendite@anh-project.it" className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">vendite@anh-project.it</a>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex items-start gap-5 transition-colors duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Telefono</h4>
                                <p className="text-gray-600 dark:text-gray-400">+39 02 1234 5678</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Lun-Ven: 9:00 - 18:00</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex items-start gap-5 transition-colors duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Sede</h4>
                                <p className="text-gray-600 dark:text-gray-400">Via Example, 123</p>
                                <p className="text-gray-600 dark:text-gray-400">20100 Milano, Italia</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-300">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Orari di supporto</h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                                Il nostro team di supporto è disponibile dal lunedì al venerdì, dalle 9:00 alle 18:00. Per urgenze fuori orario, contattaci via email e ti risponderemo il prima possibile.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}