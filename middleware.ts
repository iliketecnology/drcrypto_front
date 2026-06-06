// PRIMEIRA linha: define globalThis.__dirname antes do next-intl carregar o
// ua-parser-js compilado, que quebraria no Edge runtime (ver dirname-polyfill).
import './dirname-polyfill';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
