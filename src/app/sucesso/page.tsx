export default async function Sucesso({
  searchParams,
}: {
  searchParams: Promise<{ nome?: string }>;
}) {
  const params = await searchParams;
  const nome = params.nome || "";

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="inline-flex flex-col items-center gap-1">
          <span className="text-2xl font-bold tracking-[0.3em] text-[#C9A84C]">
            LPX
          </span>
          <span className="text-xs tracking-[0.5em] text-[#555] uppercase">
            Marketing
          </span>
        </div>

        {/* Check icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#C9A84C]"
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

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">Termo Assinado!</h1>
          {nome && (
            <p className="text-[#C9A84C] font-medium">Obrigado(a), {nome}.</p>
          )}
          <p className="text-[#666] text-sm leading-relaxed">
            Seu Termo de Autorização de Uso de Imagem foi registrado com
            sucesso. Uma cópia em PDF foi enviada para o seu e-mail.
          </p>
        </div>

        {/* Checklist */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6 text-sm space-y-3 text-left">
          {[
            "Assinatura registrada com sucesso",
            "Comprovante enviado por e-mail",
            "Documento arquivado com segurança",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-[#C9A84C]/15 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-3 h-3 text-[#C9A84C]"
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
              <span className="text-[#777]">{item}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#333]">
          LPX Marketing · Documento gerado eletronicamente
        </p>
      </div>
    </main>
  );
}
