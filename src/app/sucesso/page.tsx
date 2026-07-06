import Image from "next/image";

export default async function Sucesso({
  searchParams,
}: {
  searchParams: Promise<{ nome?: string }>;
}) {
  const params = await searchParams;
  const nome = params.nome || "";

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <Image
            src="/LPX_LOGO_L4.png"
            alt="LPX"
            width={110}
            height={44}
            className="h-11 w-auto"
          />
        </div>

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#EF27FF]/8 border border-[#EF27FF]/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#EF27FF]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-[#16171C]">
            Contrato Assinado!
          </h1>
          {nome && (
            <p className="text-[#EF27FF] font-medium">Obrigado(a), {nome}.</p>
          )}
          <p className="text-[#16171C]/50 text-sm leading-relaxed">
            O contrato foi registrado com sucesso. Uma cópia em PDF foi enviada
            para o seu e-mail.
          </p>
        </div>

        <div className="bg-[#f8f8fc] border border-[#16171C]/8 rounded-2xl p-6 text-sm space-y-3 text-left">
          {[
            "Assinatura registrada com sucesso",
            "Contrato arquivado com segurança",
            "Cópia em PDF enviada por e-mail",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-[#EF27FF]/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-3 h-3 text-[#EF27FF]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span className="text-[#16171C]/70">{item}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#16171C]/30">
          LPX Consultoria e Intermediação Ltda · CNPJ: 63.732.387/0001-90
        </p>
      </div>
    </main>
  );
}
