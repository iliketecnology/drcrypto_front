/**
 * Polyfill de `__dirname` para o Edge runtime (Vercel).
 *
 * O bundle compilado de `ua-parser-js` (puxado por `next/server` dentro do
 * middleware do next-intl) é traçado pela Vercel como arquivo cru de
 * `node_modules` na edge function — fora do bundle webpack, então o
 * `DefinePlugin` não o alcança. No top-level esse arquivo lê `__dirname`
 * (`__nccwpck_require__.ab = __dirname + "/"`), global que não existe no Edge,
 * lançando `ReferenceError: __dirname is not defined`
 * (MIDDLEWARE_INVOCATION_FAILED / 500).
 *
 * Definindo `__dirname` em `globalThis`, a referência bareword resolve para "/".
 * Este módulo deve ser o PRIMEIRO import do middleware: em ESM as dependências
 * são avaliadas na ordem dos imports, então isto roda antes do next-intl
 * carregar o ua-parser.
 */
const g = globalThis as typeof globalThis & { __dirname?: string };
if (typeof g.__dirname === 'undefined') {
  g.__dirname = '/';
}

export {};
