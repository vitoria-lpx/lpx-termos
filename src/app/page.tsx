import Image from "next/image";
import TermForm from "@/components/TermForm";

function Ph({ text }: { text: string }) {
  return (
    <span className="text-[#0200FC] border-b border-[#0200FC]/30 pb-px">
      {text}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold text-[#0200FC] tracking-[0.2em] uppercase border-b border-[#0200FC]/15 pb-2">
        {title}
      </h3>
      <div className="space-y-2 text-[#16171C]/70 leading-relaxed">{children}</div>
    </div>
  );
}

function Arrow({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5">
      <span className="text-[#0200FC] flex-shrink-0 mt-0.5 text-xs font-bold">▸</span>
      <span>
        {label && <strong className="text-[#16171C]/60">{label}: </strong>}
        {children}
      </span>
    </div>
  );
}

function DashItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p>
      <strong className="text-[#16171C]/70">{label}</strong>
      <span className="text-[#16171C]/50 mx-1">—</span>
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[#16171C]/8 py-5">
        <div className="max-w-4xl mx-auto px-6">
          <Image
            src="/LPX_LOGO_L4.png"
            alt="LPX"
            width={110}
            height={44}
            className="h-11 w-auto"
            priority
          />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Title */}
        <div className="space-y-2">
          <p className="text-[10px] text-[#0200FC] tracking-[0.25em] uppercase font-medium">
            Documento Oficial
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#16171C] tracking-tight">
            Contrato de Licença e Cessão de Uso de Imagem
          </h1>
          <p className="text-sm text-[#16171C]/45 max-w-xl">
            Leia o contrato abaixo, preencha seus dados e assine eletronicamente.
          </p>
        </div>

        {/* Contract document */}
        <div className="bg-white border border-[#16171C]/10 rounded-2xl overflow-hidden shadow-sm">
          {/* Document header */}
          <div className="bg-[#0200FC]/5 border-b border-[#0200FC]/12 px-8 py-6">
            <p className="text-[10px] font-bold text-[#0200FC] tracking-[0.2em] uppercase mb-2">
              Contrato de Licença e Cessão de Uso de Imagem
            </p>
            <p className="text-sm font-semibold text-[#16171C]">
              LPX Consultoria e Intermediação Ltda — CNPJ: 63.732.387/0001-90
            </p>
            <p className="text-xs text-[#16171C]/45 mt-1">
              Al. Oscar Niemeyer, 400 • Sala 307 — Nova Lima/MG — CEP 34.006-049
            </p>
          </div>

          <div className="px-8 py-8 space-y-8 text-sm">
            {/* PARTES */}
            <Section title="Partes">
              <p>
                <span className="text-[#16171C]/50 font-medium">LICENCIADA:</span>{" "}
                LPX Consultoria e Intermediação Ltda — CNPJ: 63.732.387/0001-90
              </p>
              <p>
                <span className="text-[#16171C]/50 font-medium">LICENCIANTE:</span>{" "}
                <Ph text="[NOME]" /> • CPF: <Ph text="[CPF]" /> — Residente em:{" "}
                <Ph text="[ENDEREÇO]" />
              </p>
            </Section>

            {/* OBJETO E VIGÊNCIA */}
            <Section title="Objeto e Vigência">
              <Arrow label="O quê">
                Imagem, voz, nome, likeness, fotos, vídeos, depoimentos e conteúdos
                audiovisuais produzidos pelo(a) LICENCIANTE.
              </Arrow>
              <Arrow label="Para quê">
                Campanhas publicitárias, ações institucionais, promocionais, comerciais
                e digitais da LICENCIADA.
              </Arrow>
              <Arrow label="Onde">
                Nacional e Internacional — todos os meios: mídias e plataformas digitais,
                redes sociais (Instagram, TikTok, Facebook, dentre outras), marketplaces,
                websites, TV, rádio, impresso, streaming, e tecnologias futuras.
              </Arrow>
              <Arrow label="Prazo">
                5 anos, com renovação automática. Rescisão mediante aviso escrito com 6
                meses de antecedência.
              </Arrow>
              <Arrow label="Pós-vigência">
                Materiais já publicados podem permanecer em circulação, portfólio e
                histórico de campanhas sem custo adicional.
              </Arrow>
            </Section>

            {/* DIREITOS DA LICENCIADA */}
            <Section title="Direitos da Licenciada">
              <DashItem label="Uso e Edição">
                Editar, adaptar, cortar, reproduzir, sincronizar, impulsionar, legendar,
                traduzir, remixar, reutilizar e transformar materiais (sem autorização
                adicional).
              </DashItem>
              <DashItem label="Publicidade Digital">
                Campanhas patrocinadas, tráfego pago, dark posts, whitelisting, branded
                content e IA (sem autorização adicional).
              </DashItem>
              <DashItem label="Sublicenciamento">
                Grupo econômico, afiliadas, agências de publicidade, parceiros comerciais
                e prestadores de serviço.
              </DashItem>
            </Section>

            {/* REMUNERAÇÃO */}
            <Section title="Remuneração">
              <p>
                A remuneração ajustada entre as PARTES abrange integralmente todos os
                direitos previstos neste contrato, não sendo devida qualquer remuneração
                adicional, presente ou futura, a qualquer título.
              </p>
            </Section>

            {/* DECLARAÇÕES E GARANTIAS */}
            <Section title="Declarações e Garantias do(a) Licenciante">
              <p>
                Possui plena capacidade e legitimidade para celebrar este contrato. Não
                possui exclusividade ou impedimento que restrinja os direitos aqui
                concedidos. Os materiais fornecidos não violam direitos autorais ou
                direitos de terceiros. Responde integralmente por reclamações judiciais
                ou extrajudiciais decorrentes dos materiais fornecidos. Eventual
                divulgação de material pelo(a) LICENCIANTE ocorrerá por mera
                liberalidade, não podendo a LICENCIADA exigir qualquer publicação, salvo
                ajuste expresso por escrito entre as PARTES.
              </p>
            </Section>

            {/* RESPONSABILIDADES ADICIONAIS */}
            <Section title="Responsabilidades Adicionais">
              <DashItem label="Cláusula Moral">
                A LICENCIADA pode rescindir imediatamente caso o(a) LICENCIANTE pratique
                atos que afetem sua reputação: escândalos, crimes ou condutas ilícitas.
              </DashItem>
              <DashItem label="Indenização">
                O(A) LICENCIANTE indeniza a LICENCIADA por violação de direitos,
                falsidade de declarações, uso indevido de conteúdo e descumprimento
                contratual.
              </DashItem>
              <DashItem label="Confidencialidade">
                O(A) LICENCIANTE mantém sigilo sobre informações, estratégias, campanhas
                e dados da LICENCIADA, sob pena de responsabilização.
              </DashItem>
            </Section>

            {/* DISPOSIÇÕES GERAIS */}
            <Section title="Disposições Gerais">
              <p>
                <strong className="text-[#16171C]/70">Vínculo:</strong> Este contrato
                NÃO estabelece vínculo empregatício, societário ou representativo entre
                as partes.
              </p>
              <p>
                <strong className="text-[#16171C]/70">Foro:</strong> Comarca de Belo
                Horizonte/MG para dirimir quaisquer controvérsias decorrentes deste
                contrato.
              </p>
            </Section>

            {/* Signature block */}
            <div className="border-t border-[#16171C]/8 pt-8 space-y-5">
              <p className="text-[#16171C]/55 text-sm">
                Belo Horizonte, <Ph text="[data de assinatura]" />.
              </p>
              <div className="space-y-2 text-sm text-[#16171C]/70">
                <p>
                  <span className="font-medium text-[#16171C]/50">LICENCIADA:</span>{" "}
                  LPX Consultoria e Intermediação Ltda — CNPJ: 63.732.387/0001-90
                </p>
                <p>
                  <span className="font-medium text-[#16171C]/50">LICENCIANTE:</span>{" "}
                  <Ph text="[NOME]" /> — CPF: <Ph text="[CPF]" />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <TermForm />
      </div>

      <footer className="border-t border-[#16171C]/8 py-8 text-center mt-4">
        <p className="text-xs text-[#16171C]/25">
          © {new Date().getFullYear()} LPX Consultoria e Intermediação Ltda —
          CNPJ: 63.732.387/0001-90
        </p>
      </footer>
    </main>
  );
}
