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

export default function TermForm() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSigned, setHasSigned] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const router = useRouter();

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#16171C";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getCtx = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext("2d") : null;
  };

  const getXY = (
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number
  ) => {
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  // Mouse
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    const { x, y } = getXY(canvas, e.clientX, e.clientY);
    const ctx = getCtx();
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getXY(canvas, e.clientX, e.clientY);
    const ctx = getCtx();
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasSigned) setHasSigned(true);
  };

  const onMouseUp = () => {
    isDrawing.current = false;
  };

  // Touch
  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    const touch = e.touches[0];
    const { x, y } = getXY(canvas, touch.clientX, touch.clientY);
    const ctx = getCtx();
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const touch = e.touches[0];
    const { x, y } = getXY(canvas, touch.clientX, touch.clientY);
    const ctx = getCtx();
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasSigned) setHasSigned(true);
  };

  const onTouchEnd = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCtx();
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasSigned(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (endereco.trim().length < 10) {
      setError("O endereço deve ter pelo menos 10 caracteres.");
      return;
    }

    if (!hasSigned) {
      setError("Por favor, adicione sua assinatura no campo acima.");
      return;
    }

    const assinatura = canvasRef.current?.toDataURL("image/png") ?? "";
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cpf, endereco, email, assinatura }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error || "Erro ao processar a assinatura. Tente novamente."
        );
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

  return (
    <div className="bg-[#f8f8fc] border border-[#16171C]/8 rounded-2xl p-8">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#16171C] mb-1">
          Assinar Contrato
        </h2>
        <p className="text-sm text-[#16171C]/50">
          Preencha seus dados e adicione sua assinatura manuscrita para
          concluir.
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

        {/* Signature canvas */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#16171C]/40 uppercase tracking-widest">
              Assinatura *
            </label>
            {hasSigned && (
              <button
                type="button"
                onClick={clearCanvas}
                className="text-xs text-[#0200FC]/60 hover:text-[#0200FC] transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="relative rounded-xl border border-[#16171C]/15 bg-white overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-[140px] block cursor-crosshair touch-none"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />
            {!hasSigned && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2">
                <svg
                  className="w-5 h-5 text-[#16171C]/20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                <p className="text-xs text-[#16171C]/25 select-none">
                  Desenhe sua assinatura aqui
                </p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-[#16171C]/30">
            Use o mouse ou o dedo (celular) para assinar dentro do campo acima.
          </p>
        </div>

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
