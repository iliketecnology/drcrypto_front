/** Logos inline pra marcas/redes citadas no site.
 * Não usa logos oficiais 1:1 (copyright); são interpretações geometricamente
 * fiéis das formas canônicas de cada marca. */

type LogoProps = {
  size?: number;
  className?: string;
};

/** Tether (USDT) · círculo com símbolo ₮ central */
export function USDTLogo({ size = 24, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Tether USDT"
      className={className}
    >
      <defs>
        <linearGradient id="usp-usdt-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2BC18B" />
          <stop offset="100%" stopColor="#26A17B" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#usp-usdt-bg)" />
      <g fill="white">
        {/* Top bar do "T" */}
        <rect x="14" y="20" width="36" height="6" rx="0.5" />
        {/* Stem do "T" (com gap superior por causa da bar) */}
        <rect x="28.5" y="26" width="7" height="22" rx="0.5" />
        {/* "elipse de moeda" característica que cruza o stem (Tether style) */}
        <ellipse
          cx="32"
          cy="34"
          rx="14"
          ry="5"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
        />
      </g>
    </svg>
  );
}

/** PIX (Bacen) · símbolo oficial.
 * Path SVG do Simple Icons (CC0) · forma característica do logo PIX. */
export function PIXLogo({ size = 24, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="PIX Bacen"
      className={className}
    >
      <defs>
        <linearGradient id="usp-pix-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3FD8C7" />
          <stop offset="100%" stopColor="#1FA9A0" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#usp-pix-bg)" />
      <g transform="translate(4 4)" fill="white">
        <path d="M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156" />
      </g>
    </svg>
  );
}

/** X (antigo Twitter) */
export function XLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="X"
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** Instagram · câmera retangular com círculo central */
export function InstagramLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Instagram"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Telegram · paper plane */
export function TelegramLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Telegram"
      className={className}
      fill="currentColor"
    >
      <path d="M21.94 4.18c-.13-.55-.78-.84-1.32-.59L2.74 11.16c-.55.24-.55 1.01 0 1.25l4.61 2.05 1.78 5.7c.13.42.66.55.95.22l2.76-3.05 4.86 3.61c.43.32 1.06.08 1.16-.45l3.07-15.7c.04-.21.02-.43-.01-.61zm-13.7 11.06l-.55-1.76 9.74-7.18-7.97 9.16z" />
    </svg>
  );
}

/** Bacen badge minimalista · pra usar como "selo" institucional */
export function BacenBadge({ size = 18, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Banco Central"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9.5 L12 4 L21 9.5" />
      <path d="M5 10 L5 18 M9 10 L9 18 M15 10 L15 18 M19 10 L19 18" />
      <path d="M3 20 L21 20" />
    </svg>
  );
}

/** Envelope · genérico pra contato */
export function MailIcon({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Email"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7 L12 13 L20.5 7" />
    </svg>
  );
}

/** WhatsApp · símbolo característico (telefone + balão) */
export function WhatsAppLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="WhatsApp"
      className={className}
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 22a10 10 0 1 1 5.04-1.359L7.05 22 8.45 17.06A10 10 0 0 1 12 22z" />
    </svg>
  );
}

/** TMBS · selo "Powered by" minimal · círculo segmentado tipo logo geométrico */
export function TMBSLogo({ size = 18, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="TMBS"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="12" cy="12" r="9" strokeDasharray="2 2.5" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
