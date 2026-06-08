"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const FONTS = [
  { label: "Dancing Script", family: "'Dancing Script', cursive", weight: "600", size: 46 },
  { label: "Great Vibes",    family: "'Great Vibes', cursive",    weight: "400", size: 52 },
  { label: "Parisienne",     family: "'Parisienne', cursive",     weight: "400", size: 40 },
];

function randomId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export default function TermForm() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Signature state
  const [sigNome, setSigNome] = useState("");
  const [rubrica, setRubrica] = useState("");
  const [fontIndex, setFontIndex] = useState(0);
  const [signatureId] = useState(randomId);

  const hiddenCanvasSig = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRub = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Great+Vibes&family=Parisienne&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  // Sync sigNome and rubrica from nome
  useEffect(() => {
    setSigNome(nome);
    setRubrica(getInitials(nome));
  }, [nome]);

  const cycleFont = useCallback(() => {
    setFontIndex((i) => (i + 1) % FONTS.length);
  }, []);

  const renderTextToCanvas = async (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    text: string,
    fontFamily: string,
    fontWeight: string,
    fontSize: number,
    w: number,
    h: number
  ): Promise<string> => {
    const fontStr = `${fontWeight} ${fontSize}px ${fontFamily}`;
    try { await document.fonts.load(fontStr, text); } catch { /* proceed */ }

    const canvas = canvasRef.current;
    if (!canvas) return "";
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#16171C";
    ctx.font = fontStr;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.trim(), w / 2, h / 2);

    return canvas.toDataURL("image/png");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (endereco.trim().length < 10) {
      setError("O endereço deve ter pelo menos 10 caracteres.");
      return;
    }
    if (!sigNome.trim()) {
      setError("Por favor, preencha seu nome no campo de assinatura.");
      return;
    }

    setLoading(true);
    setError("");

    const font = FONTS[fontIndex];
    const assinatura = await renderTextToCanvas(
      hiddenCanvasSig,
      sigNome,
      font.family,
      font.weight,
      font.size,
      480,
      120
    );

    try {
      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cpf, endereco, email, assinatura }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao processar. Tente novamente.");
        return;
      }
      router.push(`/sucesso?nome=${encodeURIComponent(nome)}`);
    } catch {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-white border border-[#16171C]/15 rounded-xl px-4 py-3 text-[#16171C] placeholder-[#16171C]/30 focus:outline-none focus:border-[#0200FC]/50 focus:ring-1 focus:ring-[#0200FC]/15 transition-colors duration-200";

  const font = FONTS[fontIndex];

  return (
    <div className="bg-[#f8f8fc] border border-[#16171C]/8 rounded-2xl p-8">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#16171C] mb-1">Assinar Contrato</h2>
        <p className="text-sm text-[#16171C]/50">
          Preencha seus dados e adote sua assinatura eletrônica para concluir.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Form fields */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#16171C]/40 uppercase tracking-widest">Nome Completo *</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Seu nome completo" className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#16171C]/40 uppercase tracking-widest">CPF *</label>
          <input type="text" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} required placeholder="000.000.000-00" maxLength={14} className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#16171C]/40 uppercase tracking-widest">Endereço Completo *</label>
          <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} required minLength={10} placeholder="Rua, número, bairro, cidade, estado" className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#16171C]/40 uppercase tracking-widest">E-mail *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" className={inputClass} />
        </div>

        {/* DocuSign-style signature block */}
        <div className="rounded-2xl border border-[#16171C]/10 bg-white overflow-hidden">

          {/* Header */}
          <div className="px-6 py-4 border-b border-[#16171C]/8 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#0200FC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="text-sm font-semibold text-[#16171C]">Assinatura Eletrônica</span>
          </div>

          <div className="p-6 space-y-5">

            {/* Nome + Rubrica side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-[#16171C]/40 uppercase tracking-widest">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={sigNome}
                  onChange={(e) => setSigNome(e.target.value)}
                  placeholder="Nome para assinatura"
                  className="w-full bg-[#f8f8fc] border border-[#16171C]/12 rounded-lg px-3 py-2 text-sm text-[#16171C] placeholder-[#16171C]/25 focus:outline-none focus:border-[#0200FC]/40 focus:ring-1 focus:ring-[#0200FC]/10 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-[#16171C]/40 uppercase tracking-widest">
                  Rubrica
                </label>
                <input
                  type="text"
                  value={rubrica}
                  onChange={(e) => setRubrica(e.target.value.toUpperCase().slice(0, 3))}
                  placeholder="Iniciais"
                  maxLength={3}
                  className="w-full bg-[#f8f8fc] border border-[#16171C]/12 rounded-lg px-3 py-2 text-sm text-[#16171C] placeholder-[#16171C]/25 focus:outline-none focus:border-[#0200FC]/40 focus:ring-1 focus:ring-[#0200FC]/10 transition-colors"
                />
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-[#16171C]/8">
              <div className="px-4 py-2 border-b-2 border-[#0200FC] -mb-px">
                <span className="text-xs font-semibold text-[#0200FC] tracking-widest uppercase">
                  Selecionar Estilo
                </span>
              </div>
            </div>

            {/* Signature preview */}
            <div className="rounded-xl border-2 border-[#0200FC]/20 bg-white overflow-hidden">
              <div className="px-6 pt-6 pb-4 flex items-center justify-center min-h-[96px]">
                {sigNome.trim() ? (
                  <span
                    style={{
                      fontFamily: font.family,
                      fontSize: `${font.size}px`,
                      fontWeight: font.weight,
                      color: "#16171C",
                      lineHeight: 1.2,
                    }}
                  >
                    {sigNome}
                  </span>
                ) : (
                  <span className="text-sm text-[#16171C]/25">
                    Preencha seu nome acima para visualizar
                  </span>
                )}
              </div>

              <div className="px-6 py-3 border-t border-[#16171C]/6 bg-[#f8f8fc] flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#16171C]/40 leading-relaxed">
                    Assinado eletronicamente por LPX Marketing
                  </p>
                  <p className="text-[10px] text-[#16171C]/25 font-mono mt-0.5">
                    ID: {signatureId}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-[#0200FC]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Font name + Alterar estilo */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#16171C]/35">{font.label}</span>
              <button
                type="button"
                onClick={cycleFont}
                className="text-xs font-medium text-[#0200FC] hover:text-[#0200FC]/70 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Alterar estilo
              </button>
            </div>

          </div>
        </div>

        {/* Hidden canvases */}
        <canvas ref={hiddenCanvasSig} className="hidden" />
        <canvas ref={hiddenCanvasRub} className="hidden" />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0200FC] hover:bg-[#0200FC]/90 active:bg-[#0100d0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors duration-200 tracking-widest uppercase mt-2"
        >
          {loading ? "Processando..." : "Adotar Assinatura"}
        </button>

        <p className="text-xs text-[#16171C]/30 text-center leading-relaxed pt-1">
          Ao clicar em &quot;Adotar Assinatura&quot;, você confirma que leu,
          compreendeu e concorda com todos os termos do contrato acima.
        </p>
      </form>
    </div>
  );
}
