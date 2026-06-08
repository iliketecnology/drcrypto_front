# Integração OprPay · guia técnico

Documento pra o time técnico do cliente plugar o frontend OprPay (entregue pela PSYCO) no backend real de swap USDT → PIX.

Todo o fluxo de UI está pronto e funcional como mock. Os pontos abaixo são os hooks de integração · cada um lista o arquivo, a linha aproximada e o que precisa ser feito.

> **Rede:** o produto opera **apenas Polygon** (USDT.POL). Não há seleção de rede no
> wizard. Onde este guia menciona "por rede", leia "Polygon".

> **Endpoint atual:** o `SwapWizard.tsx` ainda referencia o backend da base original
> (`https://crypto2pay-backend-uspix.mebq4k.easypanel.host/...`). Confirmar se o
> OprPay reutiliza esse backend ou terá um próprio, e atualizar as URLs antes de produção.

---

## 1. Cotação USDT → BRL

**Arquivo:** `lib/useUsdtBrlRate.ts`

**Estado atual:** consome CoinGecko público (`/api/v3/simple/price?ids=tether&vs_currencies=brl`) com fallback hardcoded em `5.02` e refresh a cada 60s.

**O que mudar pra produção:**
- Trocar o endpoint pra cotação interna (com spread + margem aplicados pelo backend).
- Considerar passar o `tenantId` na URL pra cotação personalizada por revendedor (se aplicável ao whitelabel).
- Considerar travar a cotação por X segundos no client após o user iniciar o wizard (hoje só atualiza no background).

**Sugestão de API:**

```http
GET /v1/rate?network=polygon&tenant={tenantId}
→ { "rate": 5.04, "lockedUntil": "2026-05-25T18:32:00Z" }
```

---

## 2. Endereço de depósito Polygon

**Arquivo:** `components/wizard/types.ts` · constante `NETWORK_ADDRESS`

**Estado atual:**

```ts
export const NETWORK_ADDRESS: Record<Network, string> = {
  polygon: '0x9aF3c2B8e5F1d4A6c0E7b9D2f8A1c3B5e7F0a9D4',  // placeholder
};
```

**O que mudar:**
- O endereço real deve vir do backend, idealmente **gerado por transação** (HD wallet derivation) pra rastreabilidade.
- Cada swap deve ter um endereço único por usuário/operação, com TTL ligado ao QR (15min hoje em `PIX_EXPIRY_SECONDS`).

**Sugestão de fluxo:**

1. User completa Step 3 do wizard (chave PIX + carteira retorno + e-mail).
2. Frontend faz `POST /v1/swaps` com payload do Step 1-3.
3. Backend retorna `{ swapId, depositAddress, expiresAt, txId }`.
4. Step 4 do wizard consome essa resposta · não usa mais `NETWORK_ADDRESS`.

Substituir `Step4QR` em `SwapWizard.tsx` pra receber o address do backend em vez da constante.

---

## 3. QR Code real

**Arquivo:** `components/wizard/SwapWizard.tsx` · função `QRCodeMock`

**Estado atual:** grid 15×15 gerado por `Math.sin` aleatório · puramente decorativo. Não é um QR válido.

**O que mudar:**
- Trocar `QRCodeMock` por geração real do QR usando `qrcode` (mais leve) ou `qr-code-styling` (visual mais bonito · combina com o tema violeta).
- O conteúdo do QR deve ser o endereço + valor em formato compatível com a wallet do usuário (Polygon / EVM):
  - `ethereum:0xCONTRACT_USDT@137/transfer?address=DEPOSIT&uint256=AMOUNT`

```bash
pnpm add qrcode
# ou
pnpm add qr-code-styling
```

```tsx
import QRCode from 'qrcode';
// ...
const dataUrl = await QRCode.toDataURL(payload, { margin: 0, color: { dark: '#9d2bed', light: '#ffffff' }});
```

Manter o overlay do `ChainLogo` no centro (visual atual).

---

## 4. Criação do swap (onComplete)

**Arquivo:** `components/wizard/SwapWizard.tsx` · `handleComplete`

**Estado atual:**

```ts
const handleComplete = () => {
  onComplete({
    amountUSDT, amountBRL, network, pixKey, pixKeyType,
    returnWallet, receiptEmail, txHash, completedAt: Date.now(), rate,
  });
};
```

Só monta o objeto local e chama `onComplete` (que abre o `ReceiptDialog`).

**O que mudar:**
- Antes de chamar `onComplete`, fazer `POST /v1/swaps/{id}/confirm` (ou `POST /v1/swaps` se o swap só nasce depois do user confirmar).
- Tratar erros do backend e mostrar inline (não toast surpresa — usar o padrão de erro existente no Step 3).
- Buscar o `txId` real do backend e atualizar `SwapResult.txHash` (hoje é hardcoded em `INITIAL_STATE`).

---

## 5. Verificação on-chain (VerifyingFlow)

**Arquivo:** `components/wizard/SwapWizard.tsx` · `VerifyingFlow`

**Estado atual:** 3 steps com `setTimeout` aleatório (2.8s a 4.6s cada). Puramente cosmético.

**O que mudar:**
- Substituir `setTimeout` por **polling** real do status do swap:

```http
GET /v1/swaps/{id}/status
→ { "state": "awaiting_deposit" | "confirming_onchain" | "settling_pix" | "completed" | "failed" }
```

- Mapear os 3 steps existentes do `VerifyingFlow` pros estados do backend.
- Quando `state === 'completed'`, chamar `onComplete()` (que abre o comprovante).
- Quando `state === 'failed'`, mostrar erro inline (criar variação do `VerifyingFlow` pra erro · não usar toast).
- Polling: 2s de intervalo é razoável. SSE/WebSocket é melhor se backend suportar.

---

## 6. Envio do comprovante

**Arquivo:** `components/wizard/ReceiptDialog.tsx` · botão "Enviar Comprovante"

**Estado atual:**

```tsx
<button onClick={() => setSent(true)} disabled={sent}>
  {sent ? '✓ Comprovante enviado' : 'Enviar Comprovante →'}
</button>
```

Só altera estado local. Não envia nada.

**O que mudar:**

```http
POST /v1/swaps/{id}/receipt/send
Body: { "email": "..." }
→ { "delivered": true }
```

Tratar loading state (entre clicar e backend responder) · sugestão: animar o botão pra "Enviando…" antes do "✓ enviado".

Considerar gerar PDF do comprovante no backend e anexar no e-mail.

---

## 7. Cálculo da taxa do provedor

**Arquivo:** `components/wizard/types.ts` · `LIQUIDITY_FEE`

**Estado atual:**

```ts
export const LIQUIDITY_FEE: Record<Network, number> = {
  polygon: 0.03, // 3%
};
```

Hardcoded no client. O `ReceiptDialog` calcula `feeUSDT = amountUSDT * feePct` e mostra no comprovante.

**O que mudar:**
- Mover pra resposta do backend (POST `/v1/swaps/{id}/quote` ou similar).
- O backend deve retornar `feePct` ou `feeUSDT` direto.
- A taxa pode variar por tenant / volume / horário · não mantém sentido ser constante hardcoded.

---

## 8. ID End-to-End do PIX

**Arquivo:** `components/wizard/ReceiptDialog.tsx` · `useEndToEndId`

**Estado atual:** gera string aleatória de 32 chars com prefixo `E17028875` (formato visual do E2E PIX).

**O que mudar:** o E2E real é gerado pelo provedor PIX bancário · deve vir do backend na resposta do swap completado. Substituir `useEndToEndId` por leitura de `data.e2eId` (adicionar campo em `SwapResult`).

---

## 9. Validação inline de carteira retorno

**Arquivo:** `components/wizard/SwapWizard.tsx` · `Step3Return` + `isValidWallet` em `types.ts`

**Estado atual:** regex client-side Polygon (`/^0x[a-fA-F0-9]{40}$/`).

**Está OK pra MVP**, mas pra produção considerar:
- Validar checksum EVM (EIP-55) pra Polygon.
- Verificar via RPC se o endereço já existe on-chain (opcional · evita typos pra contratos).
- Mostrar warning se o endereço de retorno for igual ao de depósito.

---

## 10. Segurança / rate limit

**Estado atual:** nenhum. O frontend pode disparar requests à vontade.

**O que adicionar no backend:**
- Rate limit no `POST /v1/swaps` por IP + por carteira (sugestão: 10/min por IP, 5/min por carteira).
- Captcha invisível (Cloudflare Turnstile) na criação do swap. Frontend está preparado pra isso via Provider · pedir pra PSYCO adicionar quando for ligar.
- Validar server-side que `amountUSDT >= 10` e `amountBRL <= 250000` (já validado no client mas não confiar).
- HMAC de webhook quando backend notifica swap concluído.

---

## Modelo sugerido de endpoints

```
GET    /v1/rate?network=polygon&tenant={t}        → cotação travada
POST   /v1/swaps                                   → criar swap (Step 3 → 4)
GET    /v1/swaps/{id}                              → detalhes
GET    /v1/swaps/{id}/status                       → polling do flow
POST   /v1/swaps/{id}/receipt/send                 → e-mail comprovante
```

---

## Pontos que NÃO precisam de backend (mexer cuidado)

- Mudança de idioma (next-intl, client-side puro).
- Validação visual dos forms (regex já está OK).
- Animações Motion (`AnimatePresence`, `motion.div`).
- Hero, FAQ, About, Differentials, SupportedNetworks · todos puro frontend.
- Páginas legais (`/termos`, `/privacidade`) · estáticas.

---

## Contato pro frontend

- **PSYCO** · chris@psyco.lol
- Ajustes visuais, copy, novas seções, animações: por aqui.
- Integração backend e operação do produto: time técnico do cliente.
