'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function StepOneCompany({ 
  formData, errors, touched, plans, isCloudManaged, 
  handleChange, handleBlur, handleImageUpload, onNext 
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getInputClasses = (id) => `w-full bg-gray-50 dark:bg-[#0a0f1a] border rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition-all ${touched[id] && errors[id] ? "border-red-500 focus:ring-2 focus:ring-red-500/50" : "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"}`;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10h3v10H4zM10 4h3v16h-3zM16 14h3v6h-3z" /></svg>
        </Link>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dati Azienda</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Passo 1 di 2</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Azienda *</label>
          <input id="tenant_name" type="text" value={formData.tenant_name} onChange={handleChange} onBlur={handleBlur} className={getInputClasses('tenant_name')} placeholder="Acme Corp" />
          {touched.tenant_name && errors.tenant_name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.tenant_name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Partita IVA *</label>
          <input id="vat_number" type="text" value={formData.vat_number} onChange={handleChange} onBlur={handleBlur} className={getInputClasses('vat_number')} placeholder="IT12345678901" />
          {touched.vat_number && errors.vat_number && <p className="text-red-500 text-xs mt-1 font-medium">{errors.vat_number}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Indirizzo Workspace *</label>
        <div className="flex">
          <input id="subdomain" type="text" value={formData.subdomain} onChange={handleChange} onBlur={handleBlur} className={`${getInputClasses('subdomain')} rounded-r-none border-r-0`} placeholder="acme-corp" />
          <span className="inline-flex items-center px-4 rounded-r-xl border border-l-0 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-[#151e2e] text-gray-500 dark:text-gray-400 text-sm font-medium whitespace-nowrap">.anh-project.it</span>
        </div>
        {touched.subdomain && errors.subdomain && <p className="text-red-500 text-xs mt-1 font-medium">{errors.subdomain}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Piano Selezionato *</label>
          <div className="relative">
            <select id="plan_name" value={formData.plan_name} onChange={handleChange} className={`${getInputClasses('plan_name')} appearance-none cursor-pointer pr-10`}>
              {plans.length > 0 ? (
                plans.map(p => (
                  <option key={p.Name} value={p.Name.toLowerCase()}>{p.Name} - €{parseFloat(p.Price).toFixed(0)}/mese</option>
                ))
              ) : (
                <>
                  <option value="basic">Piano Basic</option>
                  <option value="standard">Piano Standard</option>
                  <option value="premium">Piano Premium</option>
                </>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
            Tipo Database *
            {!isCloudManaged && <span className="text-xs text-orange-500 font-bold" title="Questo piano supporta solo il database locale">Forzato</span>}
          </label>
          {isCloudManaged ? (
            <div className="relative">
              <select id="db_type" value={formData.db_type} onChange={handleChange} className={`${getInputClasses('db_type')} appearance-none cursor-pointer pr-10`}>
                <option value="hosted">In Cloud (Gestito da noi)</option>
                <option value="private">Privato / Server Locale</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          ) : (
            <div className="relative">
              <select id="db_type" disabled value="private" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-400 dark:text-gray-500 outline-none appearance-none cursor-not-allowed">
                <option value="private">Privato / Locale</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800/50">
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors flex items-center gap-1">
          <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          {showAdvanced ? 'Nascondi opzioni opzionali' : 'Mostra opzioni opzionali (Indirizzo, Logo, Colore)'}
        </button>
        
        {showAdvanced && (
          <div className="mt-4 grid grid-cols-2 gap-4 p-5 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-gray-800 rounded-2xl animate-fade-in">
            <div className="col-span-2 flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-white dark:bg-[#0f1623]">
                {formData.logo ? <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" /> : <span className="text-[10px] text-gray-400 uppercase font-bold">Logo</span>}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Carica Logo Aziendale</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 cursor-pointer" />
              </div>
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Via e Civico</label>
              <input id="street" type="text" value={formData.street} onChange={handleChange} className={getInputClasses('street')} />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Città</label>
              <input id="city" type="text" value={formData.city} onChange={handleChange} className={getInputClasses('city')} />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Prov. (Sigla)</label>
              <input id="province" type="text" maxLength="2" placeholder="MI" value={formData.province} onChange={handleChange} onBlur={handleBlur} className={getInputClasses('province')} />
              {touched.province && errors.province && <p className="text-red-500 text-xs mt-1 font-medium">{errors.province}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Interno/Ufficio</label>
              <input id="suite" type="text" value={formData.suite} onChange={handleChange} className={getInputClasses('suite')} />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Colore Brand</label>
              <div className="flex items-center gap-2">
                <input id="primary_color" type="color" value={formData.primary_color} onChange={handleChange} className="w-12 h-12 p-1 bg-white border border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer" />
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{formData.primary_color}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <button onClick={onNext} className="w-full py-4 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
        Continua
      </button>
    </div>
  );
}