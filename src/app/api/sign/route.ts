import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, cpf, email } = body as {
      nome?: string;
      cpf?: string;
      email?: string;
    };

    if (!nome?.trim() || !cpf?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "desconhecido";

    const assinado_em = new Date();

    const { error: dbError } = await supabase.from("termos_assinados").insert({
      nome: nome.trim(),
      cpf: cpf.trim(),
      email: email.trim(),
      ip,
      assinado_em: assinado_em.toISOString(),
    });

    if (dbError) {
      console.error("[Supabase]", dbError);
      return NextResponse.json(
        { error: "Erro ao registrar assinatura. Tente novamente." },
        { status: 500 }
      );
    }

    const dataFormatada = format(
      assinado_em,
      "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss",
      { locale: ptBR }
    );

    const doc = buildPDF({
      nome: nome.trim(),
      cpf: cpf.trim(),
      email: email.trim(),
      dataFormatada,
      ip,
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const fileName = `termo-lpx-${nome.trim().replace(/\s+/g, "-").toLowerCase()}.pdf`;

    const { error: emailError } = await resend.emails.send({
      from: "LPX Marketing <onboarding@resend.dev>",
      to: ["leo@lpxmarketing.com", email.trim()],
      subject: `Termo de Autorização assinado — ${nome.trim()}`,
      html: buildEmailHtml({ nome: nome.trim(), dataFormatada }),
      attachments: [{ filename: fileName, content: pdfBuffer }],
    });

    if (emailError) {
      console.error("[Resend]", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[sign]", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}

function buildPDF({
  nome,
  cpf,
  email,
  dataFormatada,
  ip,
}: {
  nome: string;
  cpf: string;
  email: string;
  dataFormatada: string;
  ip: string;
}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 22;
  const maxWidth = pageWidth - margin * 2;
  let y = 18;

  // Gold top bar
  doc.setFillColor(201, 168, 76);
  doc.rect(0, 0, pageWidth, 3, "F");

  y += 10;

  // Title block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text("LPX MARKETING", pageWidth / 2, y, { align: "center" });

  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text("TERMO DE AUTORIZAÇÃO DE USO DE IMAGEM", pageWidth / 2, y, {
    align: "center",
  });

  y += 7;
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Body
  const termsText = `Pelo presente instrumento, o(a) signatário(a) identificado(a) ao final deste documento, doravante denominado(a) AUTORIZANTE, autoriza a empresa LPX Marketing, doravante denominada AUTORIZATÁRIA, a utilizar sua imagem, voz, nome e demais aspectos de sua identidade visual e fonética, captados em fotografias, vídeos, gravações audiovisuais e demais mídias.

1. OBJETO DA AUTORIZAÇÃO
A presente autorização abrange a utilização da imagem, voz e nome do AUTORIZANTE para fins de produção de conteúdo digital, campanhas publicitárias, materiais de marketing e comunicação, publicações em redes sociais (Instagram, TikTok, YouTube, Facebook, entre outras), peças criativas, materiais institucionais e qualquer outra forma de divulgação desenvolvida pela AUTORIZATÁRIA ou em nome de seus clientes.

2. ABRANGÊNCIA TERRITORIAL
A autorização ora concedida é válida em todo o território nacional e internacional, sem restrição geográfica, incluindo plataformas digitais de alcance global.

3. PRAZO DE VIGÊNCIA
A presente autorização é concedida por prazo indeterminado, podendo ser revogada pelo AUTORIZANTE mediante notificação escrita à AUTORIZATÁRIA com antecedência mínima de 30 (trinta) dias.

4. REMUNERAÇÃO
A presente autorização é concedida a título gratuito, salvo disposição em contrário prevista em instrumento contratual específico celebrado entre as partes.

5. DIREITOS ÉTICOS E MORAIS
A AUTORIZATÁRIA compromete-se a utilizar a imagem do AUTORIZANTE de forma ética e respeitosa, sendo vedada a utilização em contextos que possam atentar contra a honra, a dignidade ou a reputação do AUTORIZANTE.

6. PROTEÇÃO DE DADOS (LGPD)
Os dados pessoais fornecidos serão tratados em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD), utilizados exclusivamente para fins relacionados à execução deste Termo.

7. ACEITE ELETRÔNICO
O preenchimento e envio do formulário, com os dados pessoais do AUTORIZANTE, constitui aceite eletrônico válido e vinculante, nos termos da Lei Federal nº 14.063/2020.`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 55, 55);

  const lines = doc.splitTextToSize(termsText, maxWidth);
  const lineHeight = 5;

  for (const line of lines) {
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  // Signatário box
  y += 10;
  if (y > pageHeight - 70) {
    doc.addPage();
    y = 20;
  }

  const boxH = 58;
  doc.setFillColor(252, 250, 244);
  doc.roundedRect(margin, y, maxWidth, boxH, 3, 3, "F");
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, maxWidth, boxH, 3, 3, "S");

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(160, 128, 48);
  doc.text("DADOS DO SIGNATÁRIO", margin + 6, y);

  const labelX = margin + 6;
  const valueX = margin + 30;
  const rowH = 7;

  const rows: [string, string][] = [
    ["Nome:", nome],
    ["CPF:", cpf],
    ["E-mail:", email],
    ["Assinado em:", dataFormatada],
    ["IP de origem:", ip],
  ];

  for (const [label, value] of rows) {
    y += rowH;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(label, labelX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(value, valueX, y);
  }

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(170, 170, 170);
  doc.text(
    "Documento gerado eletronicamente · LPX Marketing · contato@lpxmarketing.com",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );

  // Gold bottom bar
  doc.setFillColor(201, 168, 76);
  doc.rect(0, pageHeight - 3, pageWidth, 3, "F");

  return doc;
}

function buildEmailHtml({
  nome,
  dataFormatada,
}: {
  nome: string;
  dataFormatada: string;
}) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f0f0f0; }
    .wrap { max-width: 580px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    .top-bar { height: 4px; background: #C9A84C; }
    .header { background: #0a0a0a; padding: 32px 40px; text-align: center; }
    .logo-mark { font-size: 22px; font-weight: 700; letter-spacing: 8px; color: #C9A84C; }
    .logo-sub { font-size: 10px; letter-spacing: 10px; color: #444; margin-top: 4px; text-transform: uppercase; }
    .body { padding: 40px; }
    .body h2 { color: #111; font-size: 20px; margin-bottom: 16px; }
    .body p { color: #555; font-size: 14px; line-height: 1.7; margin-bottom: 16px; }
    .card { background: #faf8f2; border-left: 3px solid #C9A84C; border-radius: 6px; padding: 18px 20px; margin: 24px 0; }
    .card p { margin: 0; color: #333; font-size: 13px; }
    .card strong { color: #111; }
    .checklist { list-style: none; margin: 0 0 20px; }
    .checklist li { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #555; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
    .check { width: 18px; height: 18px; border-radius: 50%; background: #C9A84C22; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #C9A84C; font-size: 11px; }
    .footer { background: #0a0a0a; padding: 20px 40px; text-align: center; }
    .footer p { color: #333; font-size: 11px; }
    a { color: #C9A84C; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top-bar"></div>
    <div class="header">
      <div class="logo-mark">LPX</div>
      <div class="logo-sub">Marketing</div>
    </div>
    <div class="body">
      <h2>Termo Assinado com Sucesso</h2>
      <p>Olá, <strong>${nome}</strong>!</p>
      <p>Seu Termo de Autorização de Uso de Imagem foi registrado com sucesso na plataforma da LPX Marketing. O documento completo está anexado a este e-mail em formato PDF.</p>
      <div class="card">
        <p><strong>Data e hora da assinatura:</strong><br>${dataFormatada}</p>
      </div>
      <ul class="checklist">
        <li><span class="check">✓</span> Assinatura registrada com sucesso</li>
        <li><span class="check">✓</span> Documento arquivado com segurança</li>
        <li><span class="check">✓</span> Comprovante em PDF em anexo</li>
      </ul>
      <p>Em caso de dúvidas, entre em contato pelo e-mail <a href="mailto:contato@lpxmarketing.com">contato@lpxmarketing.com</a>.</p>
    </div>
    <div class="footer">
      <p>LPX Marketing · Documento gerado eletronicamente</p>
    </div>
  </div>
</body>
</html>`;
}
