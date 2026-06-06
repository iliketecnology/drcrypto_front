import type { LegalDoc } from '@/lib/legal-content';

/** Layout canônico de páginas legais (Termos / Privacidade).
 *
 * Estilo: contraste alto, tipografia editorial generosa, mesma paleta verde
 * bancária do site. Server component puro — sem JS no cliente. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <article className="relative isolate overflow-hidden bg-white">
      {/* Halo verde discreto no topo, idêntico ao hero mas mais sutil */}
      <div
        aria-hidden
        className="absolute -z-10 top-[6%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse, var(--color-green-100) 0%, transparent 65%)',
        }}
      />

      <div className="container-app relative pt-24 pb-20 md:pt-32 md:pb-28 lg:pt-36">
        <header className="max-w-[68ch]">
          <span
            className="eyebrow inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full"
            style={{
              background: 'rgba(157, 43, 237, 0.08)',
              border: '1px solid rgba(157, 43, 237, 0.18)',
              color: 'var(--color-green-900)',
            }}
          >
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: 'var(--color-green-500)',
                boxShadow: '0 0 12px var(--color-green-500)',
              }}
            />
            Documento legal
          </span>

          <h1 className="display-xl mt-8" style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5rem)' }}>
            {doc.title}
          </h1>

          <p
            className="mono-num mt-6 text-[12px] tracking-wider uppercase font-semibold"
            style={{ color: 'var(--color-ink-500)' }}
          >
            {doc.lastUpdated}
          </p>

          <p className="body-lg mt-10 max-w-[60ch]" style={{ color: 'var(--color-ink-700)' }}>
            {doc.intro}
          </p>
        </header>

        <div
          aria-hidden
          className="mt-14 h-px w-full max-w-3xl"
          style={{
            background:
              'linear-gradient(90deg, var(--color-green-300), transparent 80%)',
          }}
        />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* TOC sticky (somente desktop) */}
          <nav
            aria-label="Índice"
            className="hidden lg:block lg:col-span-3 self-start sticky top-28"
          >
            <p
              className="text-[10px] uppercase tracking-wider font-bold"
              style={{ color: 'var(--color-ink-500)' }}
            >
              Índice
            </p>
            <ol className="mt-4 flex flex-col gap-2 list-none">
              {doc.sections.map((s, i) => (
                <li key={i}>
                  <a
                    href={`#sec-${i + 1}`}
                    className="text-[13px] leading-snug transition-colors hover:text-[color:var(--color-green-700)]"
                    style={{ color: 'var(--color-ink-700)' }}
                  >
                    {s.h}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="lg:col-span-9 max-w-[72ch] flex flex-col gap-12">
            {doc.sections.map((section, i) => (
              <section key={i} id={`sec-${i + 1}`} className="scroll-mt-28">
                <h2
                  className="display-md"
                  style={{
                    fontSize: 'clamp(1.25rem, 2.2vw, 1.65rem)',
                    fontWeight: 700,
                    letterSpacing: '-0.015em',
                    color: 'var(--color-ink-900)',
                  }}
                >
                  {section.h}
                </h2>

                {section.p?.map((p, j) => (
                  <p
                    key={`p-${j}`}
                    className="body-md mt-4 leading-relaxed"
                    style={{ color: 'var(--color-ink-700)' }}
                  >
                    {p}
                  </p>
                ))}

                {section.ul && (
                  <ul className="mt-4 flex flex-col gap-2">
                    {section.ul.map((item, j) => (
                      <li
                        key={`li-${j}`}
                        className="body-md leading-relaxed flex gap-3"
                        style={{ color: 'var(--color-ink-700)' }}
                      >
                        <span
                          aria-hidden
                          className="mt-[10px] shrink-0 w-1.5 h-1.5 rounded-full"
                          style={{ background: 'var(--color-green-500)' }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <footer
              className="mt-8 pt-10 border-t"
              style={{ borderColor: 'var(--color-ink-200)' }}
            >
              <p
                className="text-[12px]"
                style={{ color: 'var(--color-ink-500)' }}
              >
                TMBS, LLC · 8 The Green, Ste R, Dover, State of Delaware, Zip Code 19901
                <br />
                Para questões sobre este documento: tmbs@tmbs.tech
              </p>
            </footer>
          </div>
        </div>
      </div>
    </article>
  );
}
