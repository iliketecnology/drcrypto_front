/** Conteúdo legal da OprPay · TMBS, LLC (Delaware).
 *
 * Mantido fora do bundle de translations (`messages/*.json`) porque é carregado
 * só nas páginas /termos e /privacidade — não vale a pena pagar o peso em toda
 * navegação da home. Estrutura tipada permite renderização semântica direta. */

export type LegalSection = {
  /** Cabeçalho da seção (já vem numerado). */
  h: string;
  /** Parágrafos puros. */
  p?: string[];
  /** Lista bulletada opcional. */
  ul?: string[];
};

export type LegalDoc = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

export type LegalLocale = "pt" | "en" | "es";
export type LegalKind = "terms" | "privacy";

const LAST_UPDATED = {
  pt: "25 de maio de 2026",
  en: "May 25, 2026",
  es: "25 de mayo de 2026",
} as const;

/* ============================== TERMS · PT ============================== */

const TERMS_PT: LegalDoc = {
  title: "Termos de Uso",
  lastUpdated: `Última atualização: ${LAST_UPDATED.pt}`,
  intro:
    "Estes Termos regem o uso da plataforma OprPay, serviço de conversão de USDT em reais via PIX. Ao iniciar uma transação, você concorda com as condições abaixo.",
  sections: [
    {
      h: "1. Identificação",
      p: [
        'O OprPay é operado por TMBS, LLC ("TMBS"), pessoa jurídica constituída no Estado de Delaware, Estados Unidos da América, com sede em 8 The Green, Ste R, Dover, State of Delaware, Zip Code 19901. Contato: tmbs@tmbs.tech.',
      ],
    },
    {
      h: "2. Objeto",
      p: [
        "O OprPay oferece serviço de conversão de criptoativos USDT (Tether USD) em reais brasileiros (BRL), com liquidação via PIX. Não custodiamos USDT, BRL ou qualquer outro ativo: a operação é executada de ponta a ponta no momento da transação.",
      ],
    },
    {
      h: "3. Elegibilidade",
      p: [
        "Você declara ter pelo menos 18 anos e capacidade legal para contratar este serviço. O destino do PIX deve ser uma conta bancária válida em território brasileiro.",
      ],
    },
    {
      h: "4. Operação",
      ul: [
        "Rede USDT suportada: Polygon (USDT.POL).",
        "Valor mínimo por transação: 10 USDT.",
        "Valor máximo por transação: R$ 30.000,00.",
        "Quantidade de transações diárias: ilimitada.",
        "A cotação USDT/BRL é apresentada no momento da geração do QR Code e tem validade limitada (15 minutos).",
      ],
    },
    {
      h: "5. Responsabilidades do usuário",
      p: [
        "Você é integralmente responsável por: (i) conferir a chave PIX informada antes de confirmar a transação; (ii) informar uma carteira de retorno válida na rede USDT selecionada; (iii) garantir que o endereço de retorno é controlado por você. Erros de digitação, escolha equivocada de rede ou envio para endereço de terceiros não são reversíveis.",
      ],
    },
    {
      h: "6. Estorno automático",
      p: [
        "Caso o PIX não seja recebido em até 15 minutos após a confirmação on-chain do pagamento em USDT, o sistema realiza automaticamente o estorno do valor para a carteira de retorno informada, em USDT. O valor estornado é o valor originalmente enviado e pode sofrer variação cambial em relação à cotação inicial.",
      ],
    },
    {
      h: "7. Limitações de responsabilidade",
      p: [
        "O OprPay não se responsabiliza por: (i) erros de digitação, endereço de carteira ou rede selecionada pelo usuário; (ii) atrasos das redes blockchain públicas (Polygon) ou da rede PIX; (iii) bloqueios bancários, judiciais ou regulatórios alheios ao nosso controle; (iv) prejuízos decorrentes de oscilação cambial entre o início e a conclusão da operação.",
      ],
    },
    {
      h: "8. Conformidade e prevenção a fraudes",
      p: [
        "Operamos em conformidade com a legislação aplicável a serviços de pagamento e prevenção à lavagem de dinheiro. Podemos suspender, recusar ou estornar operações em caso de suspeita fundamentada de uso indevido, fraude, lavagem de capitais ou descumprimento de ordem de autoridade competente.",
      ],
    },
    {
      h: "9. Propriedade intelectual",
      p: [
        "Todo o conteúdo, marca, código-fonte e interface do OprPay é de propriedade da TMBS, LLC. É vedada a reprodução, modificação ou exploração comercial sem autorização expressa e por escrito.",
      ],
    },
    {
      h: "10. Alterações",
      p: [
        "Podemos atualizar estes Termos a qualquer momento, com aviso na página inicial. A versão vigente é sempre a publicada nesta URL, identificada pela data no topo do documento.",
      ],
    },
    {
      h: "11. Lei aplicável e foro",
      p: [
        "Estes Termos são regidos pela legislação do Estado de Delaware, Estados Unidos da América, sem prejuízo dos direitos do consumidor brasileiro garantidos pela legislação aplicável no Brasil. Disputas serão resolvidas preferencialmente por arbitragem, ressalvado o direito de recurso aos juízos competentes.",
      ],
    },
    {
      h: "12. Contato",
      p: ["Dúvidas, solicitações e notificações: tmbs@tmbs.tech."],
    },
  ],
};

/* ============================ PRIVACY · PT ============================= */

const PRIVACY_PT: LegalDoc = {
  title: "Política de Privacidade",
  lastUpdated: `Última atualização: ${LAST_UPDATED.pt}`,
  intro:
    "Esta Política explica como o OprPay trata seus dados pessoais. Foi escrita em linguagem direta, sem floreios, para que você saiba exatamente o que coletamos, por quê, e por quanto tempo.",
  sections: [
    {
      h: "1. Quem somos",
      p: [
        "O OprPay é operado por TMBS, LLC, com sede em 8 The Green, Ste R, Dover, State of Delaware, Zip Code 19901. Para questões sobre dados pessoais: tmbs@tmbs.tech.",
      ],
    },
    {
      h: "2. Dados que coletamos",
      p: [
        "Para executar uma operação de swap USDT→PIX, coletamos exclusivamente:",
      ],
      ul: [
        "Chave PIX informada para recebimento dos reais.",
        "E-mail para envio do comprovante.",
        "Endereço de carteira USDT de retorno (rede Polygon).",
        "Metadados técnicos da transação: hash blockchain, timestamp, valor, rede USDT escolhida.",
        "Dados mínimos de navegação: endereço IP, user-agent, idioma do navegador.",
      ],
    },
    {
      h: "3. O que NÃO coletamos",
      p: [
        "Não solicitamos CPF, RG, comprovantes de residência, selfies, vídeos de prova de vida ou qualquer documento de identificação. Não fazemos KYC para usar o serviço. Sua carteira USDT e sua chave PIX são a única identificação técnica necessária.",
      ],
    },
    {
      h: "4. Finalidades do tratamento",
      ul: [
        "Executar a operação de conversão e liquidação PIX.",
        "Enviar o comprovante de transação ao e-mail informado.",
        "Cumprir obrigações legais e regulatórias (registros AML/KYT mínimos).",
        "Prevenir fraudes e usos indevidos do serviço.",
      ],
    },
    {
      h: "5. Bases legais (LGPD)",
      ul: [
        "Execução de contrato (Art. 7º, V, LGPD): dados necessários à operação.",
        "Cumprimento de obrigação legal (Art. 7º, II): registros AML/KYT.",
        "Legítimo interesse (Art. 7º, IX): prevenção a fraude.",
      ],
    },
    {
      h: "6. Compartilhamento",
      p: [
        "Compartilhamos apenas o estritamente necessário à execução do serviço:",
      ],
      ul: [
        "Parceiros bancários e provedores PIX: chave PIX e valor, para liquidação.",
        "Redes blockchain públicas: o endereço da carteira de retorno e o hash da transação ficam registrados publicamente, pela natureza tecnológica da blockchain.",
        "Autoridades competentes: mediante ordem judicial ou requisição administrativa formal.",
      ],
      // segunda lista renderizada após o ul é fechada com parágrafo abaixo
    },
    {
      h: "7. O que não fazemos com seus dados",
      p: [
        "Não vendemos, alugamos ou cedemos seus dados a terceiros para fins de marketing. Não usamos seus dados para treinar modelos de IA. Não fazemos perfilamento publicitário.",
      ],
    },
    {
      h: "8. Retenção",
      p: [
        "Mantemos registros das operações pelo prazo mínimo exigido pela legislação aplicável (até 5 anos), inclusive após a conclusão da operação, para fins de auditoria e cumprimento de obrigações regulatórias. Dados mínimos de navegação são descartados em até 90 dias.",
      ],
    },
    {
      h: "9. Seus direitos",
      p: ["Você pode, a qualquer momento, solicitar:"],
      ul: [
        "Acesso aos seus dados.",
        "Correção de dados incorretos ou desatualizados.",
        "Anonimização ou exclusão de dados não cobertos por obrigação legal de retenção.",
        "Informação sobre compartilhamentos realizados.",
        "Revogação de consentimento, quando aplicável.",
      ],
    },
    {
      h: "10. Cookies",
      p: [
        "O OprPay não utiliza cookies de marketing nem trackers de terceiros. Usamos exclusivamente cookies técnicos essenciais ao funcionamento do site (preferência de idioma e sessão).",
      ],
    },
    {
      h: "11. Segurança",
      p: [
        "Implementamos medidas técnicas e organizacionais razoáveis para proteger seus dados, incluindo transporte criptografado (HTTPS), segregação de ambientes e acesso restrito.",
      ],
    },
    {
      h: "12. Transferência internacional",
      p: [
        "Por sermos uma empresa sediada nos Estados Unidos, seus dados podem ser processados em servidores fora do Brasil, sempre com mecanismos adequados de proteção previstos na LGPD e em legislação correlata.",
      ],
    },
    {
      h: "13. Alterações",
      p: [
        "Podemos atualizar esta Política periodicamente. A versão vigente é sempre a publicada nesta URL, identificada pela data no topo do documento.",
      ],
    },
    {
      h: "14. Contato do encarregado de dados",
      p: ["tmbs@tmbs.tech"],
    },
  ],
};

/* ============================== TERMS · EN ============================== */

const TERMS_EN: LegalDoc = {
  title: "Terms of Use",
  lastUpdated: `Last updated: ${LAST_UPDATED.en}`,
  intro:
    "These Terms govern your use of the OprPay platform, a USDT-to-BRL conversion service settled via PIX. By initiating a transaction, you agree to the conditions below.",
  sections: [
    {
      h: "1. Identification",
      p: [
        'OprPay is operated by TMBS, LLC ("TMBS"), a limited liability company incorporated in the State of Delaware, United States of America, with its registered office at 8 The Green, Ste R, Dover, State of Delaware, Zip Code 19901. Contact: tmbs@tmbs.tech.',
      ],
    },
    {
      h: "2. Service description",
      p: [
        "OprPay converts USDT (Tether USD) into Brazilian reais (BRL), settled through PIX. We do not custody USDT, BRL or any other asset: every operation is executed end-to-end at transaction time.",
      ],
    },
    {
      h: "3. Eligibility",
      p: [
        "You represent that you are at least 18 years old and have legal capacity to contract. The PIX destination must be a valid Brazilian bank account.",
      ],
    },
    {
      h: "4. Operation",
      ul: [
        "Supported USDT network: Polygon (USDT.POL).",
        "Minimum per transaction: 10 USDT.",
        "Maximum per transaction: R$ 99,000.00.",
        "Daily transactions: unlimited.",
        "The USDT/BRL rate is locked at QR generation and is valid for 15 minutes.",
      ],
    },
    {
      h: "5. User responsibilities",
      p: [
        "You are solely responsible for: (i) verifying the PIX key before confirming; (ii) providing a valid return wallet on the selected USDT network; (iii) ensuring the return address is under your control. Typos, wrong network choice or sending to third-party addresses cannot be reversed.",
      ],
    },
    {
      h: "6. Automatic refund",
      p: [
        "If PIX is not received within 15 minutes after the USDT payment is confirmed on-chain, the system automatically refunds the amount in USDT to the return wallet you provided. The refunded amount is the original amount sent and may be subject to FX fluctuation versus the initial rate.",
      ],
    },
    {
      h: "7. Limitation of liability",
      p: [
        "OprPay is not liable for: (i) user typos, wrong wallet address or wrong network; (ii) public blockchain (Polygon) or PIX network delays; (iii) banking, judicial or regulatory blocks outside our control; (iv) losses due to FX fluctuation between the start and the completion of the operation.",
      ],
    },
    {
      h: "8. Compliance and fraud prevention",
      p: [
        "We operate in compliance with applicable payment services and anti-money-laundering legislation. We may suspend, refuse or refund operations upon reasonable suspicion of misuse, fraud, money laundering or non-compliance with orders from competent authorities.",
      ],
    },
    {
      h: "9. Intellectual property",
      p: [
        "All content, brand assets, source code and interface of OprPay are owned by TMBS, LLC. Reproduction, modification or commercial exploitation without express written authorization is prohibited.",
      ],
    },
    {
      h: "10. Changes",
      p: [
        "We may update these Terms at any time, with notice on the home page. The current version is always the one published at this URL, identified by the date at the top of the document.",
      ],
    },
    {
      h: "11. Governing law and venue",
      p: [
        "These Terms are governed by the laws of the State of Delaware, United States of America, without prejudice to consumer rights granted to Brazilian users by Brazilian legislation. Disputes will preferably be resolved through arbitration, without prejudice to the right of recourse to competent courts.",
      ],
    },
    {
      h: "12. Contact",
      p: ["Questions, requests and notices: tmbs@tmbs.tech."],
    },
  ],
};

/* ============================ PRIVACY · EN ============================= */

const PRIVACY_EN: LegalDoc = {
  title: "Privacy Policy",
  lastUpdated: `Last updated: ${LAST_UPDATED.en}`,
  intro:
    "This Policy explains how OprPay handles your personal data. It is written in plain language so you know exactly what we collect, why, and for how long.",
  sections: [
    {
      h: "1. Who we are",
      p: [
        "OprPay is operated by TMBS, LLC, with registered office at 8 The Green, Ste R, Dover, State of Delaware, Zip Code 19901. Data inquiries: tmbs@tmbs.tech.",
      ],
    },
    {
      h: "2. Data we collect",
      p: ["To execute a USDT→PIX swap, we collect only:"],
      ul: [
        "PIX key for receiving BRL.",
        "Email address for the receipt.",
        "USDT return wallet address (Polygon network).",
        "Technical transaction metadata: blockchain hash, timestamp, amount, chosen USDT network.",
        "Minimal navigation data: IP address, user-agent, browser language.",
      ],
    },
    {
      h: "3. What we DON'T collect",
      p: [
        "We do not ask for ID documents, proof of address, selfies, liveness videos or any identification document. No KYC is required to use the service. Your USDT wallet and PIX key are the only technical identification needed.",
      ],
    },
    {
      h: "4. Purposes",
      ul: [
        "Execute the conversion and PIX settlement.",
        "Send the transaction receipt to the email provided.",
        "Fulfill legal and regulatory obligations (minimal AML/KYT records).",
        "Prevent fraud and service abuse.",
      ],
    },
    {
      h: "5. Legal bases (LGPD)",
      ul: [
        "Contract performance (Art. 7, V, LGPD): data needed to execute the operation.",
        "Legal obligation (Art. 7, II): AML/KYT records.",
        "Legitimate interest (Art. 7, IX): fraud prevention.",
      ],
    },
    {
      h: "6. Sharing",
      p: ["We share only what is strictly necessary to deliver the service:"],
      ul: [
        "Banking partners and PIX providers: PIX key and amount, for settlement.",
        "Public blockchain networks: the return wallet address and the transaction hash are recorded publicly by the technology's nature.",
        "Competent authorities: upon judicial order or formal administrative request.",
      ],
    },
    {
      h: "7. What we don't do with your data",
      p: [
        "We do not sell, rent or transfer your data to third parties for marketing purposes. We do not use your data to train AI models. We do not run advertising profiling.",
      ],
    },
    {
      h: "8. Retention",
      p: [
        "We keep operational records for the minimum period required by applicable legislation (up to 5 years), including after the operation is completed, for audit and regulatory compliance. Minimal navigation data is discarded within 90 days.",
      ],
    },
    {
      h: "9. Your rights",
      p: ["You may, at any time, request:"],
      ul: [
        "Access to your data.",
        "Correction of inaccurate or outdated data.",
        "Anonymization or deletion of data not covered by mandatory retention.",
        "Information about disclosures made.",
        "Consent withdrawal, when applicable.",
      ],
    },
    {
      h: "10. Cookies",
      p: [
        "OprPay does not use marketing cookies or third-party trackers. We only use technical cookies essential to site operation (language preference and session).",
      ],
    },
    {
      h: "11. Security",
      p: [
        "We implement reasonable technical and organizational measures to protect your data, including encrypted transport (HTTPS), environment segregation and restricted access.",
      ],
    },
    {
      h: "12. International transfer",
      p: [
        "As a US-based company, your data may be processed in servers outside Brazil, always with appropriate protection mechanisms provided by LGPD and related legislation.",
      ],
    },
    {
      h: "13. Changes",
      p: [
        "We may update this Policy from time to time. The current version is always the one published at this URL, identified by the date at the top.",
      ],
    },
    {
      h: "14. Data officer contact",
      p: ["tmbs@tmbs.tech"],
    },
  ],
};

/* ============================== TERMS · ES ============================== */

const TERMS_ES: LegalDoc = {
  title: "Términos de Uso",
  lastUpdated: `Última actualización: ${LAST_UPDATED.es}`,
  intro:
    "Estos Términos rigen el uso de la plataforma OprPay, servicio de conversión de USDT a reales mediante PIX. Al iniciar una transacción, aceptas las condiciones siguientes.",
  sections: [
    {
      h: "1. Identificación",
      p: [
        'OprPay es operado por TMBS, LLC ("TMBS"), persona jurídica constituida en el Estado de Delaware, Estados Unidos de América, con sede en 8 The Green, Ste R, Dover, State of Delaware, Zip Code 19901. Contacto: tmbs@tmbs.tech.',
      ],
    },
    {
      h: "2. Objeto",
      p: [
        "OprPay ofrece servicio de conversión de criptoactivos USDT (Tether USD) a reales brasileños (BRL), con liquidación vía PIX. No custodiamos USDT, BRL ni ningún otro activo: la operación se ejecuta de extremo a extremo en el momento de la transacción.",
      ],
    },
    {
      h: "3. Elegibilidad",
      p: [
        "Declaras tener al menos 18 años y capacidad legal para contratar este servicio. El destino del PIX debe ser una cuenta bancaria válida en territorio brasileño.",
      ],
    },
    {
      h: "4. Operación",
      ul: [
        "Red USDT soportada: Polygon (USDT.POL).",
        "Valor mínimo por transacción: 10 USDT.",
        "Valor máximo por transacción: R$ 30.000,00.",
        "Cantidad de transacciones diarias: ilimitada.",
        "La cotización USDT/BRL se presenta al generar el QR y tiene validez limitada (15 minutos).",
      ],
    },
    {
      h: "5. Responsabilidades del usuario",
      p: [
        "Eres íntegramente responsable de: (i) verificar la llave PIX antes de confirmar; (ii) informar una billetera de retorno válida en la red USDT seleccionada; (iii) garantizar que la dirección de retorno es controlada por ti. Errores de tipeo, elección equivocada de red o envío a terceros no son reversibles.",
      ],
    },
    {
      h: "6. Reembolso automático",
      p: [
        "Si el PIX no se recibe en hasta 15 minutos tras la confirmación on-chain del pago en USDT, el sistema realiza automáticamente el reembolso a la billetera de retorno informada, en USDT. El valor reembolsado es el originalmente enviado y puede sufrir variación cambial frente a la cotización inicial.",
      ],
    },
    {
      h: "7. Limitaciones de responsabilidad",
      p: [
        "OprPay no se responsabiliza por: (i) errores de tipeo, dirección de billetera o red seleccionada por el usuario; (ii) retrasos de las redes blockchain públicas (Polygon) o de la red PIX; (iii) bloqueos bancarios, judiciales o regulatorios ajenos a nuestro control; (iv) pérdidas derivadas de oscilación cambial entre el inicio y la conclusión de la operación.",
      ],
    },
    {
      h: "8. Cumplimiento y prevención de fraude",
      p: [
        "Operamos en conformidad con la legislación aplicable a servicios de pago y prevención de lavado de capitales. Podemos suspender, rechazar o reembolsar operaciones ante sospecha fundamentada de uso indebido, fraude, lavado de capitales o incumplimiento de orden de autoridad competente.",
      ],
    },
    {
      h: "9. Propiedad intelectual",
      p: [
        "Todo el contenido, marca, código fuente e interfaz de OprPay es propiedad de TMBS, LLC. Está prohibida la reproducción, modificación o explotación comercial sin autorización expresa por escrito.",
      ],
    },
    {
      h: "10. Modificaciones",
      p: [
        "Podemos actualizar estos Términos en cualquier momento, con aviso en la página inicial. La versión vigente es siempre la publicada en esta URL, identificada por la fecha al inicio del documento.",
      ],
    },
    {
      h: "11. Ley aplicable y foro",
      p: [
        "Estos Términos se rigen por la legislación del Estado de Delaware, Estados Unidos de América, sin perjuicio de los derechos del consumidor brasileño garantizados por la legislación aplicable en Brasil. Las disputas se resolverán preferentemente por arbitraje.",
      ],
    },
    {
      h: "12. Contacto",
      p: ["Dudas, solicitudes y notificaciones: tmbs@tmbs.tech."],
    },
  ],
};

/* ============================ PRIVACY · ES ============================= */

const PRIVACY_ES: LegalDoc = {
  title: "Política de Privacidad",
  lastUpdated: `Última actualización: ${LAST_UPDATED.es}`,
  intro:
    "Esta Política explica cómo OprPay trata tus datos personales. Está escrita en lenguaje directo para que sepas exactamente qué recopilamos, por qué y por cuánto tiempo.",
  sections: [
    {
      h: "1. Quiénes somos",
      p: [
        "OprPay es operado por TMBS, LLC, con sede en 8 The Green, Ste R, Dover, State of Delaware, Zip Code 19901. Contacto para temas de datos: tmbs@tmbs.tech.",
      ],
    },
    {
      h: "2. Datos que recopilamos",
      p: [
        "Para ejecutar una operación de swap USDT→PIX, recopilamos exclusivamente:",
      ],
      ul: [
        "Llave PIX informada para recibir los reales.",
        "E-mail para envío del comprobante.",
        "Dirección de billetera USDT de retorno (red Polygon).",
        "Metadatos técnicos de la transacción: hash blockchain, timestamp, valor, red USDT elegida.",
        "Datos mínimos de navegación: dirección IP, user-agent, idioma del navegador.",
      ],
    },
    {
      h: "3. Lo que NO recopilamos",
      p: [
        "No solicitamos documento de identidad, comprobante de domicilio, selfies, videos de prueba de vida ni ningún documento de identificación. No hacemos KYC para usar el servicio. Tu billetera USDT y tu llave PIX son la única identificación técnica necesaria.",
      ],
    },
    {
      h: "4. Finalidades del tratamiento",
      ul: [
        "Ejecutar la operación de conversión y liquidación PIX.",
        "Enviar el comprobante de transacción al e-mail informado.",
        "Cumplir obligaciones legales y regulatorias (registros AML/KYT mínimos).",
        "Prevenir fraudes y usos indebidos del servicio.",
      ],
    },
    {
      h: "5. Bases legales (LGPD)",
      ul: [
        "Ejecución de contrato (Art. 7º, V, LGPD): datos necesarios a la operación.",
        "Cumplimiento de obligación legal (Art. 7º, II): registros AML/KYT.",
        "Interés legítimo (Art. 7º, IX): prevención de fraude.",
      ],
    },
    {
      h: "6. Compartición",
      p: [
        "Compartimos solo lo estrictamente necesario para ejecutar el servicio:",
      ],
      ul: [
        "Socios bancarios y proveedores PIX: llave PIX y valor, para liquidación.",
        "Redes blockchain públicas: la dirección de la billetera de retorno y el hash de la transacción quedan registrados públicamente por la naturaleza tecnológica de la blockchain.",
        "Autoridades competentes: mediante orden judicial o requisición administrativa formal.",
      ],
    },
    {
      h: "7. Lo que no hacemos con tus datos",
      p: [
        "No vendemos, alquilamos ni cedemos tus datos a terceros con fines de marketing. No usamos tus datos para entrenar modelos de IA. No hacemos perfilamiento publicitario.",
      ],
    },
    {
      h: "8. Retención",
      p: [
        "Mantenemos registros de las operaciones por el plazo mínimo exigido por la legislación aplicable (hasta 5 años), incluso tras la conclusión de la operación, para auditoría y cumplimiento regulatorio. Datos mínimos de navegación se descartan en hasta 90 días.",
      ],
    },
    {
      h: "9. Tus derechos",
      p: ["Puedes, en cualquier momento, solicitar:"],
      ul: [
        "Acceso a tus datos.",
        "Corrección de datos incorrectos o desactualizados.",
        "Anonimización o eliminación de datos no cubiertos por obligación legal de retención.",
        "Información sobre comparticiones realizadas.",
        "Revocación de consentimiento, cuando aplicable.",
      ],
    },
    {
      h: "10. Cookies",
      p: [
        "OprPay no utiliza cookies de marketing ni rastreadores de terceros. Usamos exclusivamente cookies técnicas esenciales al funcionamiento del sitio (preferencia de idioma y sesión).",
      ],
    },
    {
      h: "11. Seguridad",
      p: [
        "Implementamos medidas técnicas y organizativas razonables para proteger tus datos, incluyendo transporte cifrado (HTTPS), segregación de entornos y acceso restringido.",
      ],
    },
    {
      h: "12. Transferencia internacional",
      p: [
        "Por ser una empresa con sede en Estados Unidos, tus datos pueden procesarse en servidores fuera de Brasil, siempre con mecanismos adecuados de protección previstos en la LGPD y legislación correlacionada.",
      ],
    },
    {
      h: "13. Modificaciones",
      p: [
        "Podemos actualizar esta Política periódicamente. La versión vigente es siempre la publicada en esta URL, identificada por la fecha al inicio del documento.",
      ],
    },
    {
      h: "14. Contacto del encargado de datos",
      p: ["tmbs@tmbs.tech"],
    },
  ],
};

/* ================================ Loader ================================ */

const DOCS: Record<LegalLocale, Record<LegalKind, LegalDoc>> = {
  pt: { terms: TERMS_PT, privacy: PRIVACY_PT },
  en: { terms: TERMS_EN, privacy: PRIVACY_EN },
  es: { terms: TERMS_ES, privacy: PRIVACY_ES },
};

export function getLegalDoc(locale: string, kind: LegalKind): LegalDoc {
  const key = (DOCS[locale as LegalLocale] ? locale : "pt") as LegalLocale;
  return DOCS[key][kind];
}
