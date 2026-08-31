import Image from "next/image";
import ContractLayoutComissionado from "@/components/ContractLayoutComissionado";

export default function Comissionado() {
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
            Documento Oficial · Modelo Comissionado
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#16171C] tracking-tight">
            Termo de Parceria Comercial
          </h1>
          <p className="text-sm text-[#16171C]/45 max-w-xl">
            Leia o termo, preencha seus dados e assine eletronicamente.
          </p>
        </div>

        <ContractLayoutComissionado />
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
