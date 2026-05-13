import "./globals.css";
import { Toaster } from 'sonner';

export const metadata = {
  title: "ANH-Project",
  description: "Intelligent project management system",
};

export default function RootLayout({ children }) {

  // Script eseguito prima del caricamento della pagina. Controlla se c'è un tema salvato, altrimenti legge la preferenza di sistema
  const themeInitScript = `
    let theme = window.localStorage.getItem('theme');
    if(!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  `

  return (
    <html
      lang="en"
      className={`h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <script 
          dangerouslySetInnerHTML={{ __html: themeInitScript }} 
          suppressHydrationWarning 
        />
      </head>
      
      <body className="bg-white dark:bg-[#0a0f1a] text-gray-900 dark:text-white transition-colors duration-300">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
