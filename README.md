# OprPay · landing whitelabel USDT → PIX

Frontend completo do OprPay · Next.js 15 App Router, TS strict, Tailwind v4, next-intl PT/EN/ES.

Whitelabel derivado da base USPIX (mesma engine de swap), com identidade própria:
marca **OprPay**, paleta violeta e **rede única Polygon**.

Entregue por **PSYCO** (chris@psyco.lol) para integração e operação pelo time técnico do cliente.

---

## Pré-requisitos

- **Node.js** 20+
- **pnpm** 9+ (`npm i -g pnpm`)
- Editor com suporte a TypeScript (VS Code recomendado)

## Dev local

```bash
pnpm install
pnpm dev
# abre em http://localhost:3100/pt
```

A porta padrão é `3100` (definida no script `dev`). Rotas localizadas em `/pt`, `/en`, `/es`.

## Build de produção

```bash
pnpm build
pnpm start
```

Sai estático nas rotas públicas (SSG por `generateStaticParams`) · pronto pra qualquer host de site estático ou Node.

## Stack

| Camada | Escolha |
| --- | --- |
| Framework | **Next.js 15** App Router (não Pages Router) |
| Linguagem | TypeScript strict |
| Estilo | **Tailwind CSS v4** · tokens via `@theme` em `styles/globals.css` (sem `tailwind.config.ts`) |
| i18n | **next-intl 3** · `routing.ts` + `[locale]/` segments |
| Animação | **Motion** (sucessor do Framer Motion) · entrada de seções e wizard |
| 3D | **react-three-fiber** + **drei** · globo wireframe na seção TrustMetrics |
| Tipografia | **Geist Sans + Mono** via `geist/font` |
| Bundler | Next 15 (Turbopack opcional) |
| Package manager | **pnpm** |

## Estrutura

```
source/
├── app/
│   ├── layout.tsx                    # root · Geist fonts + metadata + OG
│   └── [locale]/
│       ├── layout.tsx                # NextIntlProvider + Header + SwapWizardProvider + Footer
│       ├── page.tsx                  # Hero + HowItWorks + TrustMetrics + Differentials + SupportedNetworks + About + FAQ
│       ├── termos/page.tsx
│       └── privacidade/page.tsx
├── components/
│   ├── sections/                     # Home sections (Hero, FAQ, etc) + LegalPage
│   ├── ui/                           # Logo wordmark, LanguageSwitcher, CountUp, LiveTimeMetric, TransactionCard
│   ├── illustrations/                # SVGs · WorldMap, BrandLogos, ChainLogo, GlobeWireframe (R3F)
│   └── wizard/                       # SwapWizard (4 steps) + ReceiptDialog + Provider + types
├── i18n/
│   ├── routing.ts                    # locales PT/EN/ES, defaultLocale PT, localePrefix as-needed
│   ├── navigation.ts                 # Link / redirect / usePathname tipados
│   └── request.ts                    # carrega messages no server
├── lib/
│   ├── legal-content.ts              # Termos + Privacidade · objeto tipado por locale
│   └── useUsdtBrlRate.ts             # hook de cotação USDT→BRL (CoinGecko)
├── messages/
│   ├── pt.json
│   ├── en.json
│   └── es.json
├── public/
│   ├── og-wide.png                   # OG 1200×630  (TODO: trocar pela arte OprPay)
│   ├── og-square.png                 # OG 1200×1200 (TODO: trocar pela arte OprPay)
│   └── brand/tmbs-logo.png
├── styles/globals.css                # @theme tokens + classes de tipografia (.display-xl, .body-lg, .eyebrow…)
├── middleware.ts                     # next-intl middleware
└── next.config.ts
```

## Localização

- 3 locales: `pt` (default), `en`, `es`.
- Path strategy: `localePrefix: 'as-needed'` · PT na raiz, EN/ES com prefixo.
- Conteúdo em `messages/<locale>.json`. Toda string visível no frontend passa por `useTranslations` ou `getTranslations`.
- Trocar/adicionar copy: editar os 3 arquivos JSON em conjunto. Estrutura é espelhada entre locales.

## Rede suportada

**Apenas Polygon** (USDT.POL). O produto não opera Tron — não há seleção de rede no
wizard (Polygon é fixa). Tipo `Network = "polygon"` em `components/wizard/types.ts` é a
fonte de verdade; `NETWORK_ADDRESS`, `LIQUIDITY_FEE` e `WALLET_REGEX` têm só a entrada
Polygon. Pra (re)adicionar uma rede no futuro, reverter esses pontos + a UI do Step 1.

## Wizard de swap

Implementado em `components/wizard/SwapWizard.tsx` · UI completa de 4 passos + flow de verificação animado + comprovante separado em `ReceiptDialog.tsx`.

**Importante:** todo o fluxo está **mockado** no frontend. A integração com backend real está documentada em [`INTEGRATION.md`](./INTEGRATION.md) · esse é o trabalho do time técnico do cliente.

Resumo do que está mock:
- Cotação USDT→BRL puxa CoinGecko ao vivo (OK em prod, mas pode trocar provedor)
- Endereço de depósito Polygon vem de constante em `wizard/types.ts`
- QR Code é gerado mockado em `QRCodeMock` (random grid)
- `txHash` no estado inicial é hardcoded
- `VerifyingFlow` simula 3 etapas com `setTimeout` aleatório
- Botão "Enviar Comprovante" só vira "✓ enviado" no client

## Páginas legais

- `/termos` e `/privacidade` em PT/EN/ES.
- Conteúdo em `lib/legal-content.ts` (TS, tipado · não passa pelo bundle de translations pra não inflar a home).
- Layout shared em `components/sections/LegalPage.tsx` com TOC sticky em desktop.
- Entidade operadora: **TMBS, LLC** (Delaware) · mantida do contrato original.

## Identidade e tema

Paleta **violeta** em `styles/globals.css`. Nota de whitelabel: as CSS vars mantêm os
nomes `green-*` (a escala de marca herdada da base USPIX), mas os **valores são violeta** —
o Tailwind v4 gera as classes `bg-green-500` etc. a partir desses nomes em todo o código.

```css
--color-green-900: #3b0764;
--color-green-700: #7c2fd6;
--color-green-500: #9d2bed;  /* accent principal (brand) */
--color-green-300: #cf9bf5;
--color-green-100: #f1e3fc;

--color-ink-900: #1a0f2e;     /* texto principal */
--color-ink-500: #6a5f7a;
--color-ink-200: #e8e3ef;
```

Tipografia escala em `clamp()` · `.display-xl` (hero), `.display-lg` (h2), `.body-lg`, `.body-md`, `.body-sm`, `.eyebrow`, `.mono-num` (números tabulares Geist Mono). Container central: `.container-app`.

O logo no header/footer é um **wordmark de texto** (`components/ui/Logo.tsx`) — placeholder
até a arte definitiva do medalhão OprPay ser entregue tratada (sem fundo, versão clara).

## SEO e OG

- `metadataBase` em `https://oprpay.com` · **placeholder**, trocar pelo domínio real.
- Title template `%s · OprPay`
- OG wide + square em `/public/og-*.png` plugados em `app/layout.tsx` · **ainda são as
  imagens herdadas — trocar pela arte OprPay.**
- Twitter card `summary_large_image`

## Deploy

Otimizado para **Vercel** (zero-config). Comando: `vercel deploy --prod` na raiz da pasta.

Pode rodar em qualquer Node host:

```bash
pnpm build
pnpm start  # default port 3000
```

Para deploy estático puro, considerar `output: 'export'` no `next.config.ts` (cuidado: quebra Server Components dinâmicos · validar antes).

## Variáveis de ambiente

**Atualmente nenhuma é obrigatória.** O frontend opera com endpoints públicos:

- Cotação USDT/BRL: CoinGecko público (rate-limited, mas suficiente pra landing)

Quando o backend de swap for plugado, as env vars típicas serão:

```bash
NEXT_PUBLIC_SWAP_API_BASE=https://api.oprpay.com   # ajustar ao backend real
NEXT_PUBLIC_RATE_PROVIDER=internal                       # ou "coingecko"
```

> Nota: o `SwapWizard.tsx` ainda aponta para o endpoint da base original
> (`crypto2pay-backend-uspix...`). Confirmar com o time de backend se o OprPay
> usa o mesmo backend ou terá endpoint próprio, e atualizar as URLs. Detalhes em `INTEGRATION.md`.

## Próximos passos pro time técnico

1. Ler [`INTEGRATION.md`](./INTEGRATION.md).
2. Confirmar/ajustar o endpoint de backend (ver nota acima).
3. Plugar `SwapWizard.onComplete` no endpoint de criação de swap.
4. Substituir `NETWORK_ADDRESS.polygon` pelo endereço real (ou puxar do backend).
5. Trocar `QRCodeMock` por uma lib de QR real (sugestão: `qrcode` ou `qr-code-styling`).
6. Trocar `VerifyingFlow` por polling real do status do swap.
7. Ajustar cotação se for usar provedor próprio em vez de CoinGecko.
8. Configurar domínio + TLS e trocar `metadataBase` / OG images.

## Contato

- **PSYCO** (entrega frontend) · chris@psyco.lol · [psyco.lol](https://psyco.lol)
- Bugs de UI / pedidos de ajuste visual: abrir issue ou mandar lista.
- Integração / backend: responsabilidade do time técnico do cliente.

## Licença

Código entregue ao cliente sob acordo de cessão. Para uso interno e operação do produto OprPay.
# drcrypto_front
