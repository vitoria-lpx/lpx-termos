"use client";

import { useState } from "react";
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
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cpf, email }),
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
    "w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl px-4 py-3 text-white placeholder-[#2e2e2e] focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/20 transition-colors duration-200";

  return (
    <div className="bg-[#0f0f0f] border border-[#C9A84C]/20 rounded-2xl p-8">
      <h2 className="text-xl font-semibold text-white mb-1">
        Assinar Eletronicamente
      </h2>
      <p className="text-sm text-[#555] mb-8">
        Preencha seus dados para concluir a assinatura. Você receberá o
        comprovante em PDF por e-mail.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#666] uppercase tracking-widest">
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
          <label className="text-xs font-medium text-[#666] uppercase tracking-widest">
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
          <label className="text-xs font-medium text-[#666] uppercase tracking-widest">
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

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#C9A84C] hover:bg-[#D4B96A] active:bg-[#b8973b] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-xl transition-colors duration-200 tracking-wide mt-2"
        >
          {loading ? "Processando..." : "Assinar Termo"}
        </button>

        <p className="text-xs text-[#333] text-center leading-relaxed pt-1">
          Ao clicar em &quot;Assinar Termo&quot;, você confirma que leu e
          concorda com os termos acima e autoriza o uso de sua imagem pela LPX
          Marketing.
        </p>
      </form>
    </div>
  );
}
