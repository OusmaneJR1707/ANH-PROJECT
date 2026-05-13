import { notFound } from 'next/navigation';

async function getTenantData(subdomain) {
  const url = `http://localhost/ANH-PROJECT/API/tenants/verify/${subdomain}`;
  console.log("1. URL chiamato da Next:", url); // <--- LOG 1

  try {
    const res = await fetch(url, { cache: 'no-store' });
    console.log("2. Codice di risposta PHP:", res.status); // <--- LOG 2
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("3. Errore di rete (Fetch fallito):", error); // <--- LOG 3
    return null;
  }
}

export default async function TenantLayout({ children, params }) {
  const resolvedParams = await params;
  const tenant =resolvedParams.tenant;

  const tenantData = await getTenantData(tenant);

  // Se l'API PHP risponde 404, Next.js attiva automaticamente il file not-found.js più vicino
  if (!tenantData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#080c14] p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 mb-4">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Workspace non trovato
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Il workspace <span className="font-semibold text-gray-900 dark:text-gray-200">"{tenant}"</span> non è gestito dai nostri sistemi o è stato disattivato.
          </p>
          <div className="pt-6">
            <a href="http://localhost:3000" className="text-blue-600 hover:text-blue-500 font-semibold underline decoration-2 underline-offset-4">
              Torna alla pagina principale
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#080c14]">
      {children}
    </div>
  );
}