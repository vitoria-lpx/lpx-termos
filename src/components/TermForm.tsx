"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

const FONTS = [
  { id: "dancing", label: "Dancing Script", family: "'Dancing Script', cursive", weight: "600", size: "42px" },
  { id: "greatvibes", label: "Great Vibes", family: "'Great Vibes', cursive", weight: "400", size: "46px" },
  { id: "parisienne", label: "Parisienne", family: "'Parisienne', cursive", weight: "400", size: "38px" },
] as const;

type FontId = typeof FONTS[number]["id"];

export default function TermForm() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFont, setSelectedFont] = useState<FontId>("dancing");

  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Great+Vibes&family=Parisienne&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const captureSignature = async (): Promise<string> => {
    const font = FONTS.find((f) => f.id === selectedFont)!;
    const fontStr = `${font.weight} 56px ${font.family}`;

    try {
      await document.fonts.load(fontStr, nome);
    } catch {
      // proceed anyway
    }

    const canvas = hiddenCanvasRef.current;
    if (!canvas) return "";
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    canvas.width = 480;
    canvas.height = 120;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#16171C";
    ctx.font = fontStr;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(nome.trim(), canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL("image/png");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (endereco.trim().length < 10) {
      setError("O endereço deve ter pelo menos 10 caracteres.");
      return;
    }

    if (!nome.trim()) {
      setError("Por favor, preencha seu nome completo.");
      return;
    }

    setLoading(true);
    setError("");

    const assinatura = await captureSignature();

    try {
      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cpf, endereco, email, assinatura }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao processar a assinatura. Tente novamente.");
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

  const showSignaturePreview = nome.trim().length > 0;

  return (
    <div className="bg-[#f8f8fc] border border-[#16171C]/8 rounded-2xl p-8">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#16171C] mb-1">
          Assinar Contrato
        </h2>
        <p className="text-sm text-[#16171C]/50">
          Preencha seus dados e escolha o estilo da sua assinatura para concluir.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#16171C]/40 uppercase tracking-widest">
            Nome Completo *
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Seu nome completo"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#16171C]/40 uppercase tracking-widest">
            CPF *
          </label>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            required
            placeholder="000.000.000-00"
            maxLength={14}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#16171C]/40 uppercase tracking-widest">
            Endereço Completo *
          </label>
          <input
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            required
            minLength={10}
            placeholder="Rua, número, bairro, cidade, estado"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#16171C]/40 uppercase tracking-widest">
            E-mail *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
            className={inputClass}
          />
        </div>

        {/* Signature style picker */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-[#16171C]/40 uppercase tracking-widest">
            Assinatura *
          </label>

          {showSignaturePreview ? (
            <>
              <p className="text-xs text-[#16171C]/50">
                Escolha o estilo da sua assinatura:
              </p>
              <div className="grid grid-cols-1 gap-3">
                {FONTS.map((font) => {
                  const isSelected = selectedFont === font.id;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setSelectedFont(font.id)}
                      className={[
                        "w-full bg-white rounded-xl border-2 px-6 py-4 text-left transition-all duration-150 cursor-pointer",
                        isSelected
                          ? "border-[#0200FC] shadow-[0_0_0_3px_rgba(2,0,252,0.08)]"
                          : "border-[#16171C]/10 hover:border-[#16171C]/25",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-medium text-[#16171C]/30 uppercase tracking-widest">
                          {font.label}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-[#0200FC] flex items-center justify-center flex-shrink-0">
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontFamily: font.family,
                          fontSize: font.size,
                          fontWeight: font.weight,
                          color: "#16171C",
                          lineHeight: 1.2,
                          display: "block",
                        }}
                      >
                        {nome}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#16171C]/30">
                A assinatura selecionada será registrada eletronicamente junto ao contrato.
              </p>
            </>
          ) : (
            <div className="bg-white border border-[#16171C]/10 rounded-xl px-6 py-5 text-center">
              <p className="text-xs text-[#16171C]/30">
                Preencha seu nome acima para visualizar as opções de assinatura.
              </p>
            </div>
          )}
        </div>

        {/* Hidden canvas for signature capture */}
        <canvas ref={hiddenCanvasRef} className="hidden" />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0200FC] hover:bg-[#0200FC]/90 active:bg-[#0100d0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors duration-200 tracking-wide mt-2"
        >
          {loading ? "Processando..." : "Assinar e Enviar"}
        </button>

        <p className="text-xs text-[#16171C]/30 text-center leading-relaxed pt-1">
          Ao clicar em &quot;Assinar e Enviar&quot;, você confirma que leu,
          compreendeu e concorda com todos os termos do contrato acima.
        </p>
      </form>
    </div>
  );
}
