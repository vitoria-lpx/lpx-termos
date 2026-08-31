import Image from "next/image";
import Link from "next/link";

const MODELOS = [
  {
    href: "/comissionado",
    nome: "Comissionado",
    descricao: "Comissão entre 5% e 10% sobre o faturamento gerado por vendas orgânicas.",
  },
  {
    href: "/permuta",
    nome: "Permuta",
    descricao: "Participação remunerada com produtos enviados pela marca, sem contraprestação financeira.",
  },
  {
    href: "/cache-fixo",
    nome: "Cachê Fixo",
    descricao: "Valor fixo previamente acordado por campanha, apurado e pago mensalmente.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-[#16171C]/8 py-5">
        <div className="max-w-5xl mx-auto px-6">
          <Image
            src="/LPXlogonova2.png"
            alt="LPX"
            width={44}
            height={44}
            className="h-11 w-auto"
            priority
          />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <div className="space-y-2">
          <p className="text-[10px] text-[#EF27FF] tracking-[0.25em] uppercase font-medium">
            Documento Oficial
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#16171C] tracking-tight">
            Termos de Parceria Comercial
          </h1>
          <p className="text-sm text-[#16171C]/45 max-w-xl">
            Escolha o modelo de parceria correspondente para ler o termo, preencher os dados
            e assinar eletronicamente.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {MODELOS.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group block bg-white border border-[#16171C]/10 rounded-2xl p-6 shadow-sm hover:border-[#EF27FF]/40 hover:shadow-md transition-all"
            >
              <p className="text-sm font-semibold text-[#16171C] mb-2 group-hover:text-[#EF27FF] transition-colors">
                {m.nome}
              </p>
              <p className="text-xs text-[#16171C]/50 leading-relaxed">{m.descricao}</p>
            </Link>
          ))}
        </div>
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
