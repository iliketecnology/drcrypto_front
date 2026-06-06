/** Logo do Banco Central do Brasil (Bacen) versão branca.
 * Fonte: avatar do GitHub oficial (https://github.com/banco-central-do-brasil)
 * processado pra branco preservando alpha. Arquivo em /public/brand/bacen-white.png */

type Props = {
  size?: number;
  className?: string;
};

export function BacenLogo({ size = 56, className }: Props) {
  return (
    <img
      src="/brand/bacen-white.png"
      alt="Banco Central do Brasil"
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
}
