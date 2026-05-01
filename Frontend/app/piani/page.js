import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

// Funzione Server-Side per recuperare tutti i piani dal DB PHP
async function getAllPlans() {
  try {
    const PHP_API_URL = 'http://localhost/ANH-PROJECT/API'+ '/plans'; 
    
    const res = await fetch(PHP_API_URL, { cache: 'no-store' }); 
    if (!res.ok) return [];
    
    const json = await res.json();

    if (json.code === 200 || json.status === 'OK') {
      const rawPlans = json.data;

      // Ordiniamo dal più economico al più costoso
      rawPlans.sort((a, b) => parseFloat(a.Price) - parseFloat(b.Price));

      return rawPlans.map(plan => {
        const features = [];
        features.push(`Fino a ${plan.Max_Employees} dipendenti`);
        features.push(`Fino a ${plan.Max_Projects} progetti`);
        features.push(`Fino a ${plan.Max_Reports} report`);
        features.push(`Durata: ${plan.Duration_Days} giorni`);
        features.push(plan.Cloud_Managed == 1 ? "Gestione in Cloud" : "Installazione Locale");

        return {
          id: plan.Name.toLowerCase(),
          name: plan.Name,
          price: `€${parseFloat(plan.Price).toFixed(2).replace('.', ',')}/mese`,
          features: features,
          popular: plan.Name === 'Standard'
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error("Errore fetch tutti i piani:", error);
    return [];
  }
}

export default async function AllPlansPage() {
  const plans = await getAllPlans();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0a0f1a] transition-colors duration-300">
      <Header />

      <main className="grow py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Tasto Torna alla Home */}
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Torna alla Home
            </Link>
          </div>  

          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              Tutti i Piani e le Tariffe
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400">
              Scopri l'offerta completa e trova la configurazione ideale per ottimizzare il flusso di lavoro della tua azienda.
            </p>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-gray-500 dark:text-gray-400">Nessun piano disponibile al momento.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`relative bg-white dark:bg-[#0f1623] border ${
                    plan.popular ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-gray-200 dark:border-gray-800 shadow-sm'
                  } p-8 rounded-3xl flex flex-col gap-8 transition-all duration-300 hover:shadow-lg`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                      ☆ Più Popolare
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                  </div>
                  
                  <div className="flex items-baseline gap-1 -mt-4">
                    <span className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">{plan.price.split('/')[0]}</span>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">/mese</span>
                  </div>

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

                  <Link 
                    href="/register" 
                    className={`w-full text-center text-base font-semibold px-6 py-4 rounded-xl transition-all ${
                      plan.popular 
                        ? 'text-white bg-blue-600 hover:bg-blue-700' 
                        : 'text-gray-900 dark:text-white bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900'
                    }`}
                  >
                    Seleziona {plan.name}
                  </Link>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}