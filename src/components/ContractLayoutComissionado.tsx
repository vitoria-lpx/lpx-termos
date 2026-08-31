"use client";

import { useState } from "react";
import TermForm from "./TermForm";

function Ph({ text }: { text: string }) {
  return (
    <span className="text-[#EF27FF] border-b border-[#EF27FF]/30 pb-px">
      {text}
    </span>
  );
}

function ManualLink() {
  return (
    <a
      href="/manual-boas-praticas.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#EF27FF] underline underline-offset-2 hover:text-[#EF27FF]/70 transition-colors"
    >
      Manual de Boas Práticas
    </a>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold text-[#EF27FF] tracking-[0.2em] uppercase border-b border-[#EF27FF]/15 pb-2">
        {title}
      </h3>
      <div className="space-y-2 text-[#16171C]/70 leading-relaxed">{children}</div>
    </div>
  );
}

function Arrow({ label, children }: { label?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5">
      <span className="text-[#EF27FF] flex-shrink-0 mt-0.5 text-xs font-bold">▸</span>
      <span>
        {label && <strong className="text-[#16171C]/60">{label}: </strong>}
        {children}
      </span>
    </div>
  );
}

function ContractContent() {
  return (
    <div className="bg-white border border-[#16171C]/10 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-[#EF27FF]/5 border-b border-[#EF27FF]/12 px-8 py-6">
        <p className="text-[10px] font-bold text-[#EF27FF] tracking-[0.2em] uppercase mb-2">
          Termo de Parceria Comercial · Modelo Comissionado
        </p>
        <p className="text-sm font-semibold text-[#16171C]">
          LPX Consultoria e Intermediação Ltda — CNPJ: 63.732.387/0001-90
        </p>
        <p className="text-xs text-[#16171C]/45 mt-1">
          Al. Oscar Niemeyer, 400 • Sala 307 — Nova Lima/MG — CEP 34.006-049
        </p>
      </div>

      <div className="px-8 py-8 space-y-8 text-sm">
        <Section title="Partes">
          <p>
            <span className="text-[#16171C]/50 font-medium">INTERMEDIADORA:</span>{" "}
            LPX Consultoria e Intermediação Ltda — CNPJ: 63.732.387/0001-90
          </p>
          <p>
            <span className="text-[#16171C]/50 font-medium">INFLUENCIADORA:</span>{" "}
            <Ph text="[NOME]" /> • CPF: <Ph text="[CPF]" /> — Residente em:{" "}
            <Ph text="[ENDEREÇO]" />
          </p>
        </Section>

        <Section title="1. Objeto e Vigência">
          <Arrow label="O quê">
            Estabelecer condições, obrigações e responsabilidades decorrentes da parceria
            comercial entre as PARTES, especialmente quanto à participação da INFLUENCIADORA
            em campanhas, ações publicitárias, promocionais, comerciais e institucionais
            intermediadas pela INTERMEDIADORA junto a marcas e parceiros comerciais.
          </Arrow>
          <Arrow label="Prazo">
            2 anos, com renovação automática.
          </Arrow>
        </Section>

        <Section title="2. Autorização para Uso de Imagem, Voz, Nome e Conteúdo">
          <Arrow>
            A INFLUENCIADORA autoriza a utilização de sua imagem, voz, nome, likeness,
            fotografias, vídeos, depoimentos e conteúdos audiovisuais produzidos no âmbito da
            parceria, em campanhas publicitárias, ações institucionais, promocionais,
            comerciais e digitais da INTERMEDIADORA.
          </Arrow>
          <Arrow>
            A autorização é válida em território nacional e internacional e abrange todos os
            meios, incluindo mídias e plataformas digitais, Instagram, TikTok, Facebook,
            marketplaces, websites e tecnologias futuras.
          </Arrow>
          <Arrow>
            A INTERMEDIADORA poderá editar, adaptar, cortar, reproduzir, sincronizar, legendar,
            traduzir, remixar, reutilizar os materiais, sem autorização adicional.
          </Arrow>
          <Arrow>
            A autorização compreende campanhas patrocinadas, tráfego pago, impulsionamento,
            dark posts, whitelisting e branded content, sem autorização adicional.
          </Arrow>
          <Arrow>
            Os direitos previstos nessa cláusula poderão ser licenciados às marcas
            contratantes, integrantes do grupo econômico, afiliadas, agências de publicidade,
            parceiros comerciais e prestadores de serviços.
          </Arrow>
          <Arrow>
            Os materiais já publicados poderão permanecer em circulação, integrar portfólios e
            históricos de campanhas, sem remuneração adicional.
          </Arrow>
        </Section>

        <Section title="3. Comissão">
          <Arrow>
            A INFLUENCIADORA fará jus a comissão entre 5% e 10% sobre o faturamento mensal
            apurado a partir das vendas realizadas mediante a utilização do cupom ou código
            promocional a ela vinculado, conforme percentual previamente acordado para cada
            marca ou campanha.
          </Arrow>
          <Arrow>
            Na ausência de percentual expressamente pactuado para determinada campanha,
            aplicar-se-á o percentual mínimo de 5% (cinco por cento).
          </Arrow>
          <Arrow>
            O saque da comissão será liberado quando o saldo do respectivo mês atingir R$
            100,00 (cem reais) ou quando o faturamento gerado pela INFLUENCIADORA no respectivo
            mês superar R$ 1.000,00 (mil reais).
          </Arrow>
          <Arrow>
            O saldo será apurado exclusivamente sobre as vendas realizadas no respectivo mês,
            sem soma ou compensação com meses anteriores ou posteriores.
          </Arrow>
          <Arrow>
            Considera-se comissionável apenas o faturamento orgânico, gerado pelo alcance
            natural dos posts publicados pela INFLUENCIADORA em seus próprios canais. Não
            haverá comissão sobre vendas oriundas de conteúdo veiculado em mídia paga (ads,
            impulsionamento, tráfego pago ou dark posts) pela INTERMEDIADORA.
          </Arrow>
          <Arrow>
            Atingido o patamar mínimo, a INFLUENCIADORA deverá emitir a respectiva nota fiscal.
            A não emissão será interpretada como recusa da comissão, desobrigando a
            INTERMEDIADORA do respectivo pagamento até que a emissão seja regularizada.
          </Arrow>
          <Arrow>
            Prazo de pagamento: 5 dias úteis, a partir da emissão da nota fiscal.
          </Arrow>
          <Arrow>
            A INFLUENCIADORA declara que possui CNPJ ativo e compatível com a prestação dos
            serviços (CNAE 17.06.01 – Propaganda e Publicidade, inclusive Promoção de Vendas),
            comprometendo-se a manter regularidade fiscal durante a vigência da parceria.
          </Arrow>
        </Section>

        <Section title="4. Responsabilidades">
          <Arrow>
            A INFLUENCIADORA se compromete a observar a legislação aplicável às suas
            atividades, incluindo o Código de Defesa do Consumidor e as diretrizes do CONAR;
            bem como a observar o <ManualLink /> (anexo).
          </Arrow>
          <Arrow>
            A INFLUENCIADORA declara que (i) não possui exclusividade ou impedimento que
            restrinja os direitos ora concedidos, e (ii) os conteúdos por ela produzidos ou
            fornecidos não violam direitos autorais ou quaisquer outros direitos de terceiros.
          </Arrow>
          <Arrow>
            A INFLUENCIADORA é responsável pelos atos, declarações e conteúdos que produzir ou
            divulgar, respondendo por reclamações, notificações e demandas judiciais ou
            extrajudiciais, bem como pelos prejuízos deles decorrentes.
          </Arrow>
        </Section>

        <Section title="5. Rescisão">
          <Arrow>
            Comunicação prévia de 30 (trinta) dias, ressalvadas as campanhas e obrigações já
            assumidas perante terceiros.
          </Arrow>
          <Arrow>
            A INTERMEDIADORA poderá rescindir o termo em caso de descumprimento de obrigação
            contratual, violação do Manual de Conduta, prática de ato ilícito ou conduta que
            cause dano à imagem ou reputação da INTERMEDIADORA ou de seus clientes.
          </Arrow>
        </Section>

        <Section title="6. Disposições Gerais">
          <Arrow label={<ManualLink />}>
            Integra este instrumento e estabelece regras de observância pela INFLUENCIADORA.
          </Arrow>
          <Arrow label="Vínculo">
            A presente parceria não estabelece vínculo empregatício, associativo ou de
            representação entre as PARTES.
          </Arrow>
          <Arrow label="Confidencialidade">
            A INFLUENCIADORA deverá manter sigilo sobre informações comerciais, estratégicas,
            financeiras, contratuais, campanhas, briefings, dados de clientes e demais
            informações confidenciais a que tiver acesso.
          </Arrow>
          <Arrow label="Foro">
            Comarca de Belo Horizonte/MG para dirimir eventuais controvérsias decorrentes deste
            termo.
          </Arrow>
        </Section>

        <div className="border-t border-[#16171C]/8 pt-8 space-y-5">
          <p className="text-[#16171C]/55 text-sm">
            Belo Horizonte, <Ph text="[data de assinatura]" />.
          </p>
          <div className="space-y-2 text-sm text-[#16171C]/70">
            <p>
              <span className="font-medium text-[#16171C]/50">INTERMEDIADORA:</span>{" "}
              LPX Consultoria e Intermediação Ltda — CNPJ: 63.732.387/0001-90
            </p>
            <p>
              <span className="font-medium text-[#16171C]/50">INFLUENCIADORA:</span>{" "}
              <Ph text="[NOME]" /> — CPF: <Ph text="[CPF]" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContractLayoutComissionado() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:grid lg:grid-cols-[1fr_440px] lg:gap-10 lg:items-start">

      {/* Coluna do contrato */}
      <div>
        {/* Botão acordeão — visível só no mobile */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden w-full flex items-center justify-between px-5 py-4 bg-white border border-[#16171C]/10 rounded-2xl shadow-sm mb-3 text-sm font-semibold text-[#16171C] hover:bg-[#f8f8fc] transition-colors"
        >
          <span>{open ? "Fechar contrato" : "Clique e veja o contrato completo"}</span>
          <svg
            className={`w-4 h-4 text-[#EF27FF] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Conteúdo do contrato — colapsado no mobile, sempre visível no desktop */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out lg:overflow-visible lg:max-h-none ${
            open ? "max-h-[4000px]" : "max-h-0"
          }`}
        >
          <ContractContent />
        </div>
      </div>

      {/* Coluna do formulário — sticky no desktop */}
      <div className="mt-6 lg:mt-0 lg:sticky lg:top-8">
        <TermForm apiPath="/api/sign-comissionado" />
      </div>

    </div>
  );
}
