import TermForm from "@/components/TermForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#C9A84C]/15 py-6 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex flex-col items-center gap-0.5">
            <span className="text-xl font-bold tracking-[0.35em] text-[#C9A84C]">
              LPX
            </span>
            <span className="text-[10px] tracking-[0.55em] text-[#444] uppercase">
              Marketing
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-14 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-block px-3 py-1 text-[10px] tracking-widest text-[#C9A84C] border border-[#C9A84C]/25 rounded-full uppercase">
            Documento Oficial
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight">
            Termo de Autorização de
            <br />
            <span className="text-[#C9A84C]">Uso de Imagem</span>
          </h1>
          <p className="text-[#555] text-sm max-w-lg mx-auto leading-relaxed">
            Leia atentamente os termos abaixo e preencha o formulário ao final
            para assinar eletronicamente.
          </p>
        </div>

        {/* Terms document */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="border-b border-[#C9A84C]/15 px-8 py-5 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-[#C9A84C] tracking-widest uppercase">
              Termos e Condições
            </h2>
            <span className="text-[10px] text-[#333] tracking-wider uppercase">
              LPX Marketing
            </span>
          </div>

          <div className="px-8 py-8 text-sm text-[#888] leading-relaxed space-y-6">
            <p>
              Pelo presente instrumento, o(a) signatário(a) identificado(a) ao
              final deste documento, doravante denominado(a){" "}
              <strong className="text-[#ccc] font-semibold">AUTORIZANTE</strong>
              , autoriza a empresa{" "}
              <strong className="text-[#ccc] font-semibold">LPX Marketing</strong>
              , doravante denominada{" "}
              <strong className="text-[#ccc] font-semibold">AUTORIZATÁRIA</strong>
              , a utilizar sua imagem, voz, nome e demais aspectos de sua
              identidade visual e fonética, captados em fotografias, vídeos,
              gravações audiovisuais e demais mídias, nos termos a seguir.
            </p>

            <Clause number="1" title="Objeto da Autorização">
              A presente autorização abrange a utilização da imagem, voz e nome
              do AUTORIZANTE para fins de produção de conteúdo digital, campanhas
              publicitárias, materiais de marketing e comunicação, publicações em
              redes sociais (Instagram, TikTok, YouTube, Facebook, entre outras),
              peças criativas, materiais institucionais e qualquer outra forma de
              divulgação desenvolvida pela AUTORIZATÁRIA ou em nome de seus
              clientes.
            </Clause>

            <Clause number="2" title="Abrangência Territorial">
              A autorização ora concedida é válida em todo o território nacional e
              internacional, sem restrição geográfica, incluindo plataformas
              digitais de alcance global.
            </Clause>

            <Clause number="3" title="Prazo de Vigência">
              A presente autorização é concedida por prazo indeterminado, podendo
              ser revogada pelo AUTORIZANTE mediante notificação escrita à
              AUTORIZATÁRIA com antecedência mínima de 30 (trinta) dias, por meio
              do e-mail{" "}
              <span className="text-[#C9A84C]">contato@lpxmarketing.com</span>.
            </Clause>

            <Clause number="4" title="Remuneração">
              A presente autorização é concedida a título gratuito, salvo
              disposição em contrário prevista em instrumento contratual
              específico celebrado entre as partes.
            </Clause>

            <Clause number="5" title="Direitos Éticos e Morais">
              A AUTORIZATÁRIA compromete-se a utilizar a imagem do AUTORIZANTE de
              forma ética e respeitosa, sendo vedada a utilização em contextos que
              possam atentar contra a honra, a dignidade ou a reputação do
              AUTORIZANTE. Qualquer uso fora do escopo aqui definido deverá ser
              previamente autorizado por escrito.
            </Clause>

            <Clause number="6" title="Proteção de Dados (LGPD)">
              Os dados pessoais fornecidos pelo AUTORIZANTE serão tratados em
              conformidade com a Lei Geral de Proteção de Dados (Lei nº
              13.709/2018 — LGPD), sendo utilizados exclusivamente para fins
              relacionados à execução deste Termo e ao envio do comprovante de
              assinatura.
            </Clause>

            <Clause number="7" title="Aceite Eletrônico">
              O preenchimento e envio do formulário abaixo, com os dados pessoais
              do AUTORIZANTE, constitui aceite eletrônico válido e vinculante ao
              presente Termo, nos termos da Lei Federal nº 14.063/2020 e demais
              legislações aplicáveis sobre assinatura eletrônica.
            </Clause>

            <div className="mt-2 p-5 border border-[#C9A84C]/20 rounded-xl bg-[#C9A84C]/5">
              <p className="text-[#C9A84C] text-xs leading-relaxed">
                Ao assinar eletronicamente, o AUTORIZANTE declara ter lido,
                compreendido e concordado integralmente com todos os termos e
                condições acima estabelecidos.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <TermForm />
      </div>

      <footer className="border-t border-[#111] py-8 text-center">
        <p className="text-xs text-[#2e2e2e]">
          © {new Date().getFullYear()} LPX Marketing · Documento gerado
          eletronicamente
        </p>
      </footer>
    </main>
  );
}

function Clause({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-[#ddd] font-semibold text-sm">
        <span className="text-[#C9A84C] mr-1">{number}.</span> {title}
      </h3>
      <p>{children}</p>
    </div>
  );
}
