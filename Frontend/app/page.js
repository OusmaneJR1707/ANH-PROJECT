import Header from '../components/Header';
import Hero from '../components/Hero';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1a] transition-colors duration-300">
      {/* 1. In alto mettiamo l'Header (Sticky) */}
      <Header />

      <main>
        {/* 2. Sotto l'Header mettiamo la sezione Hero */}
        <Hero />

        {/* Qui aggiungeremo gli altri componenti man mano che li scriviamo:
           <Features />
           <Plans />
           <DemoCTA />
           <Contact />
           <Footer />
        */}
        
        {/* Per ora lasciamo dei segnaposto per non interrompere lo scroll */}
        <div id="funzionalita" className="h-20" />
        <div id="piani" className="h-20" />
        <div id="demo" className="h-20" />
        <div id="contatti" className="h-20" />
      </main>
    </div>
  );
}
