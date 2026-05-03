'use client';

import React, { useState } from 'react';

export default function StepTwoAdmin({ 
  formData, errors, touched, handleChange, handleBlur, handleImageUpload, setStep, onSubmit 
}) {
  const getInputClasses = (id) => `w-full bg-gray-50 dark:bg-[#0a0f1a] border rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition-all ${touched[id] && errors[id] ? "border-red-500 focus:ring-2 focus:ring-red-500/50" : "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"}`;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Profilo Amministratore</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Passo 2 di 2</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        
        {/* Caricamento Immagine Profilo Circolare */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full border-4 border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-[#0a0f1a] flex items-center justify-center relative shadow-sm">
              {formData.admin_profile_picture ? (
                <img src={formData.admin_profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
              {/* Overlay Hover */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'admin_profile_picture')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">Foto Profilo (Opzionale)</p>
        </div>

        <button type="button" onClick={() => console.log('OAuth trigger')} className="w-full flex justify-center items-center gap-3 py-3.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-[#0a0f1a] text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#151e2e] transition-colors shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Registrati con Google
        </button>

        <div className="relative flex justify-center text-sm my-6">
          <span className="px-3 bg-white dark:bg-[#0f1623] text-gray-500 font-medium relative z-10">Oppure inserisci i dati</span>
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800"></div></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
            <input id="admin_firstname" type="text" value={formData.admin_firstname} onChange={handleChange} onBlur={handleBlur} className={getInputClasses('admin_firstname')} />
            {touched.admin_firstname && errors.admin_firstname && <p className="text-red-500 text-xs mt-1 font-medium">{errors.admin_firstname}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cognome *</label>
            <input id="admin_lastname" type="text" value={formData.admin_lastname} onChange={handleChange} onBlur={handleBlur} className={getInputClasses('admin_lastname')} />
            {touched.admin_lastname && errors.admin_lastname && <p className="text-red-500 text-xs mt-1 font-medium">{errors.admin_lastname}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Lavorativa *</label>
          <input id="admin_email" type="email" value={formData.admin_email} onChange={handleChange} onBlur={handleBlur} className={getInputClasses('admin_email')} placeholder="nome@azienda.it" />
          {touched.admin_email && errors.admin_email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.admin_email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
          
          <div className="relative">
            <input 
              id="admin_password" 
              type={showPassword ? "text" : "password"} 
              value={formData.admin_password} 
              onChange={handleChange} 
              onBlur={handleBlur} 
              // Usiamo i backtick per unire le tue classi dinamiche con il padding destro per l'icona
              className={`${getInputClasses('admin_password')} pr-10`} 
              placeholder="••••••••" 
            />
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
              )}
            </button>
          </div>
          {touched.admin_password && errors.admin_password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.admin_password}</p>}
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={() => setStep(1)} className="w-1/3 py-4 rounded-xl text-base font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Indietro
          </button>
          <button type="submit" className="w-2/3 py-4 rounded-xl text-base font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md shadow-green-600/20">
            Crea Workspace
          </button>
        </div>
      </form>
    </div>
  );
}