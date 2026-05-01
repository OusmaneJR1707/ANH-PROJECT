import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Plans from '../components/Plans';

// Questa funzione gira esclusivamente sul server Node.js di Next
// Il browser dell'utente non vedrà mai questo codice
async function getPlans() {
  try {
    // 1. Chiamiamo DIRETTAMENTE la tua API PHP (senza intermediari)
    const PHP_API_URL = 'http://localhost/ANH-PROJECT/API'+ '/plans'; 
    
    const res = await fetch(PHP_API_URL, { 
      cache: 'no-store' // Per assicurarci di avere sempre i prezzi aggiornati dal DB
    }); 
    
    if (!res.ok) return [];
    
    const json = await res.json();

    if (json.code === 200 || json.status === 'OK') {
      const rawPlans = json.data;

      // 2. Ordinamento per prezzo
      rawPlans.sort((a, b) => parseFloat(a.Price) - parseFloat(b.Price));

      // 3. LA FORMATTAZIONE (spostata qui)
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
          isFeatured: plan.Is_Featured == 1,
          popular: plan.Name === 'Standard'
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error("Errore fetch server-side:", error);
    return [];
  }
}

export default async function Home() {
  // 4. Recuperiamo i piani già formattati e pronti
  const allPlans = await getPlans();
  
  // 5. Filtriamo solo quelli da mostrare in Home
  const featuredPlans = allPlans.filter(p => p.isFeatured);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1a] transition-colors duration-300">
      <Header />

      <main>
        <Hero />
        
        <Features />
        
        {/* 6. Passiamo i dati puliti al componente visivo */}
        <Plans initialPlans={featuredPlans} />
        
        <div id="demo" className="h-20" />
        <div id="contatti" className="h-20" />
      </main>
    </div>
  );
}