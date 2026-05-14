import { NextResponse } from 'next/server';

export function middleware(request) {
    const url = request.nextUrl;
    const hostname = request.headers.get('host');

    const mainDomains = ['localhost:3000', 'anh-project.it', 'www.anh-project.it'];
    const subdomain = hostname.split('.')[0];

    // 1. Ignoriamo domini principali e file di sistema/API
    if (mainDomains.includes(hostname) || url.pathname.startsWith('/api') || url.pathname.includes('.')) {
        return NextResponse.next();
    }

    // =========================================================
    // 2. IL CONTROLLO DI SICUREZZA (Stop al Loop!)
    // =========================================================
    const hasRefreshToken = request.cookies.has('refresh_token');

    // Se NON ha il cookie e cerca di curiosare fuori dal login -> Caccialo al login
    if (!hasRefreshToken && url.pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Se HA il cookie ed è finito sulla pagina login -> Riportalo alla radice (Dashboard)
    if (hasRefreshToken && url.pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // =========================================================
    // 3. IL REWRITE PER I TENANT (Il tuo codice originale)
    // =========================================================
    return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, request.url));
}