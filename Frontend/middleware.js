import { NextResponse } from 'next/server';

export function middleware(request) {
    const url = request.nextUrl;
    const hostname = request.headers.get('host');

    const mainDomains = ['localhost:3000', 'anh-project.it', 'www.anh-project.it'];

    const subdomain = hostname.split('.')[0];

    if (mainDomains.includes(hostname) || url.pathname.startsWith('/api') || url.pathname.includes('.')) {
        return NextResponse.next();
    }

    return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, request.url));
}