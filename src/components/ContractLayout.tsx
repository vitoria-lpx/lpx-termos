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

function Arrow({ label, children }: { label?: string; children: React.ReactNode }) {
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

function DashItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p>
      <strong className="text-[#16171C]/70">{label}</strong>
      <span className="text-[#16171C]/50 mx-1">—</span>
      {children}
    </p>
  );
}

function ContractContent() {
  return (
    <div className="bg-white border border-[#16171C]/10 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-[#EF27FF]/5 border-b border-[#EF27FF]/12 px-8 py-6">
        <p className="text-[10px] font-bold text-[#EF27FF] tracking-[0.2em] uppercase mb-2">
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
        <Section title="1. Partes">
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

        <Section title="2. Objeto e Vigência">
          <Arrow label="O quê">
            Imagem, voz, nome, likeness, fotos, vídeos, depoimentos e conteúdos
            audiovisuais produzidos pelo(a) LICENCIANTE.
          </Arrow>
          <Arrow label="Para quê">
            Campanhas publicitárias, ações institucionais, promocionais, comerciais
            e digitais da LICENCIADA.
          </Arrow>
          <Arrow label="Onde">
            Nacional e Internacional - todos os meios: mídias e plataformas digitais,
            redes sociais (Instagram, TikTok, Facebook, dentre outras), market places,
            websites, TV, rádio, impresso, streaming, e tecnologias futuras.
          </Arrow>
          <Arrow label="Prazo">
            2 anos, com renovação automática. Rescisão mediante aviso escrito com 6
            meses de antecedência.
          </Arrow>
          <Arrow label="Pós-vigência">
            Materiais já publicados podem permanecer em circulação, portfólio e
            histórico de campanhas sem custo adicional.
          </Arrow>
        </Section>

        <Section title="3. Direitos da Licenciada">
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

        <Section title="4. Comissão">
          <p>
            O(A) LICENCIANTE fará jus a comissão de 7% (sete por cento) sobre o
            faturamento mensal gerado por meio de suas indicações ou conteúdos
            vinculados à LICENCIADA, observadas as seguintes condições:
          </p>
          <Arrow>
            O saque da comissão será liberado quando o saldo acumulado do
            respectivo mês atingir o valor mínimo de R$ 70,00 (setenta reais).
          </Arrow>
          <Arrow>
            Alternativamente, o saque será liberado quando o faturamento gerado
            pelo(a) LICENCIANTE junto à LICENCIADA, no respectivo mês de apuração,
            superar R$ 1.000,00 (mil reais).
          </Arrow>
          <Arrow>
            Para fins desta cláusula, o saldo acumulado corresponderá
            exclusivamente às comissões decorrentes das vendas realizadas dentro do
            respectivo mês de apuração, não havendo soma ou compensação com valores
            de meses anteriores ou posteriores.
          </Arrow>
        </Section>

        <Section title="5. Declarações e Garantias do(a) Licenciante">
          <p>
            • Possui plena capacidade e legitimidade para celebrar este contrato.
          </p>
          <p>
            • Não possui exclusividade ou impedimento que restrinja os direitos
            aqui concedidos.
          </p>
          <p>
            • Os materiais fornecidos não violam direitos autorais ou direitos de
            terceiros.
          </p>
          <p>
            • Responde integralmente por reclamações judiciais ou extrajudiciais
            decorrentes dos materiais fornecidos.
          </p>
          <p>
            • Eventual divulgação de material pelo(a) LICENCIANTE ocorrerá por mera
            liberalidade, não podendo a LICENCIADA exigir qualquer publicação,
            salvo ajuste expresso por escrito entre as PARTES.
          </p>
          <p>
            • Caso a LICENCIANTE solicite a interrupção de uso de sua imagem ou
            conteúdos, a LICENCIADA cessará novas divulgações em até 30 (trinta)
            dias, permanecendo válidos os materiais já publicados e as campanhas em
            andamento até sua conclusão.
          </p>
        </Section>

        <Section title="6. Responsabilidades Adicionais">
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

        <Section title="7. Disposições Gerais">
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
  );
}

export default function ContractLayout() {
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
        <TermForm />
      </div>

    </div>
  );
}
