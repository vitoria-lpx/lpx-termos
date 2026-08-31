import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { jsPDF } from "jspdf";
const TZ = "America/Sao_Paulo";
function fmtData(d: Date) {
  const f = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("pt-BR", { ...opts, timeZone: TZ }).format(d);
  return `${f({ day: "2-digit" })} de ${f({ month: "long" })} de ${f({ year: "numeric" })}`;
}
function fmtHora(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).format(d);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, cpf, endereco, email, assinatura } = body as {
      nome?: string;
      cpf?: string;
      endereco?: string;
      email?: string;
      assinatura?: string;
    };

    if (!nome?.trim() || !cpf?.trim() || !endereco?.trim() || !email?.trim()) {
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
      endereco: endereco.trim(),
      email: email.trim(),
      ip,
      assinado_em: assinado_em.toISOString(),
    });

    if (dbError) {
      console.error("[Supabase] erro ao inserir:", dbError);
      return NextResponse.json(
        { error: "Erro ao registrar assinatura. Tente novamente." },
        { status: 500 }
      );
    }
    console.log("[Supabase] registro salvo com sucesso");

    const dataAssinatura = fmtData(assinado_em);
    const dataHoraCompleta = `${dataAssinatura} às ${fmtHora(assinado_em)}`;

    console.log("[PDF] iniciando geração...");
    let doc;
    try {
      doc = buildPDF({
        nome: nome.trim(),
        cpf: cpf.trim(),
        endereco: endereco.trim(),
        email: email.trim(),
        dataAssinatura,
        dataHoraCompleta,
        ip,
        assinatura: assinatura?.trim() || "",
      });
    } catch (pdfErr) {
      console.error("[PDF] erro na geração:", pdfErr);
      return NextResponse.json(
        { error: "Erro ao gerar o documento PDF." },
        { status: 500 }
      );
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    console.log(`[PDF] gerado com sucesso — ${pdfBuffer.byteLength} bytes`);

    const fileName = `termo-lpx-permuta-${nome.trim().replace(/\s+/g, "-").toLowerCase()}.pdf`;

    const recipients = ["leo@lpxmarketing.com", "vitoria@lpxmarketing.com", email.trim()];
    const emailPayload = {
      from: "LPX Marketing <noreply@lpxmarketing.com.br>",
      subject: `Termo de Parceria Comercial assinado — ${nome.trim()}`,
      html: buildEmailHtml({ nome: nome.trim(), dataHoraCompleta }),
      attachments: [{ filename: fileName, content: pdfBuffer }],
    };

    for (const recipient of recipients) {
      const { data: emailData, error: emailError } = await resend.emails.send({
        ...emailPayload,
        to: [recipient],
      });
      if (emailError) {
        console.error(`[Resend] erro ao enviar para ${recipient}:`, JSON.stringify(emailError));
      } else {
        console.log(`[Resend] email enviado para ${recipient} — id:`, emailData?.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[sign-permuta]", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}

type PDFParams = {
  nome: string;
  cpf: string;
  endereco: string;
  email: string;
  dataAssinatura: string;
  dataHoraCompleta: string;
  ip: string;
  assinatura: string;
};

function sectionHeader(
  doc: jsPDF,
  title: string,
  y: number,
  margin: number,
  pageW: number,
  pageH: number
): number {
  if (y > pageH - 35) { doc.addPage(); y = margin; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(239, 39, 255);
  doc.text(title.toUpperCase(), margin, y);
  y += 2;
  doc.setDrawColor(239, 39, 255);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageW - margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  return y;
}

// Renders "Label: value" or "Label — value" row with bold label
function labelRow(
  doc: jsPDF,
  label: string,
  sep: string,
  value: string,
  x: number,
  y: number,
  maxW: number,
  lh: number,
  pageH: number,
  margin: number
): number {
  if (y > pageH - 25) { doc.addPage(); y = margin; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  const labelText = label + sep + " ";
  doc.text(labelText, x, y);
  const labelW = doc.getTextWidth(labelText);
  doc.setFont("helvetica", "normal");
  const wrapped = doc.splitTextToSize(value, maxW - labelW);
  doc.text(wrapped[0], x + labelW, y);
  y += lh;
  for (let i = 1; i < wrapped.length; i++) {
    if (y > pageH - 25) { doc.addPage(); y = margin; }
    doc.text(wrapped[i], x, y);
    y += lh;
  }
  return y;
}

// Renders "▸ Label: value" arrow bullet
function arrowRow(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  maxW: number,
  lh: number,
  pageH: number,
  margin: number,
  bulletChar: string = ">"
): number {
  if (y > pageH - 25) { doc.addPage(); y = margin; }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(239, 39, 255);
  doc.text(bulletChar, x, y);
  doc.setTextColor(50, 50, 50);
  let textStartX: number;
  if (label) {
    doc.setFont("helvetica", "bold");
    const labelText = " " + label + ": ";
    doc.text(labelText, x + 3, y);
    textStartX = x + doc.getTextWidth(labelText) + 3;
    doc.setFont("helvetica", "normal");
  } else {
    textStartX = x + 5;
  }
  const wrapped = doc.splitTextToSize(value, maxW - (textStartX - x));
  doc.text(wrapped[0], textStartX, y);
  y += lh;
  for (let i = 1; i < wrapped.length; i++) {
    if (y > pageH - 25) { doc.addPage(); y = margin; }
    doc.text(wrapped[i], x, y);
    y += lh;
  }
  return y;
}

function buildPDF(params: PDFParams) {
  const { nome, cpf, endereco, email, dataAssinatura, dataHoraCompleta, ip, assinatura } = params;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxW = pageW - margin * 2;
  const lh = 5;
  let y = 0;

  doc.setFillColor(239, 39, 255);
  doc.rect(0, 0, pageW, 4, "F");

  y = 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text("LPX CONSULTORIA E INTERMEDIAÇÃO LTDA", pageW / 2, y, { align: "center" });
  y += 5.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("CNPJ: 63.732.387/0001-90", pageW / 2, y, { align: "center" });
  y += 4.5;
  doc.text("Al. Oscar Niemeyer, 400 • Sala 307 — Nova Lima/MG — CEP 34.006-049", pageW / 2, y, { align: "center" });

  y += 7;
  doc.setDrawColor(239, 39, 255);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("TERMO DE PARCERIA COMERCIAL — MODELO PERMUTA", pageW / 2, y, { align: "center" });
  y += 10;

  // PARTES
  y = sectionHeader(doc, "Partes", y, margin, pageW, pageH);
  y = labelRow(doc, "INTERMEDIADORA", ":", "LPX Consultoria e Intermediação Ltda — CNPJ: 63.732.387/0001-90", margin, y, maxW, lh, pageH, margin);
  y = labelRow(doc, "INFLUENCIADORA", ":", `${nome} • CPF: ${cpf} — Residente em: ${endereco}`, margin, y, maxW, lh, pageH, margin);
  y += 3;

  // OBJETO E VIGÊNCIA
  y = sectionHeader(doc, "1. Objeto e Vigência", y, margin, pageW, pageH);
  y = arrowRow(doc, "O quê", "Estabelecer condições, obrigações e responsabilidades decorrentes da parceria comercial entre as PARTES, especialmente quanto à participação da INFLUENCIADORA em campanhas, ações publicitárias, promocionais, comerciais e institucionais intermediadas pela INTERMEDIADORA junto a marcas e parceiros comerciais.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "Prazo", "2 anos, com renovação automática.", margin, y, maxW, lh, pageH, margin);
  y += 3;

  // AUTORIZAÇÃO
  y = sectionHeader(doc, "2. Autorização para Uso de Imagem, Voz, Nome e Conteúdo", y, margin, pageW, pageH);
  y = arrowRow(doc, "", "A INFLUENCIADORA autoriza a utilização de sua imagem, voz, nome, likeness, fotografias, vídeos, depoimentos e conteúdos audiovisuais produzidos no âmbito da parceria, em campanhas publicitárias, ações institucionais, promocionais, comerciais e digitais da INTERMEDIADORA.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "", "A autorização é válida em território nacional e internacional e abrange todos os meios, incluindo mídias e plataformas digitais, Instagram, TikTok, Facebook, marketplaces, websites, televisão, rádio, mídia impressa, streaming e tecnologias futuras.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "", "A INTERMEDIADORA poderá editar, adaptar, cortar, reproduzir, sincronizar, legendar, traduzir, remixar, reutilizar e transformar os materiais, sem autorização adicional.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "", "A autorização compreende campanhas patrocinadas, tráfego pago, impulsionamento, dark posts, whitelisting, branded content e inteligência artificial, sem autorização adicional.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "", "Os direitos previstos nessa cláusula poderão ser licenciados às marcas contratantes, integrantes do grupo econômico, afiliadas, agências de publicidade, parceiros comerciais e prestadores de serviços.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "", "Os materiais já publicados poderão permanecer em circulação, integrar portfólios e históricos de campanhas, sem remuneração adicional.", margin, y, maxW, lh, pageH, margin);
  y += 3;

  // PERMUTA
  y = sectionHeader(doc, "3. Permuta", y, margin, pageW, pageH);
  y = arrowRow(doc, "", "A participação da INFLUENCIADORA na campanha ocorrerá mediante permuta, consistente no envio, pela MARCA, diretamente à INFLUENCIADORA, dos produtos previamente definidos para a respectiva campanha, sem qualquer pagamento ou contraprestação financeira.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "", "A INTERMEDIADORA será responsável pelo alinhamento prévio com a INFLUENCIADORA quanto aos conteúdos, devendo a INFLUENCIADORA observar integralmente as condições previamente acordadas.", margin, y, maxW, lh, pageH, margin);
  y += 3;

  // RESPONSABILIDADES
  y = sectionHeader(doc, "4. Responsabilidades", y, margin, pageW, pageH);
  y = arrowRow(doc, "", "A INFLUENCIADORA se compromete a observar a legislação aplicável às suas atividades, incluindo o Código de Defesa do Consumidor e as diretrizes do CONAR; bem como a observar o Manual de Boas Práticas (anexo).", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "", "A INFLUENCIADORA declara que (i) não possui exclusividade ou impedimento que restrinja os direitos ora concedidos, e (ii) os conteúdos por ela produzidos ou fornecidos não violam direitos autorais ou quaisquer outros direitos de terceiros.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "", "A INFLUENCIADORA é responsável pelos atos, declarações e conteúdos que produzir ou divulgar, respondendo por reclamações, notificações e demandas judiciais ou extrajudiciais, bem como pelos prejuízos deles decorrentes.", margin, y, maxW, lh, pageH, margin);
  y += 3;

  // RESCISÃO
  y = sectionHeader(doc, "5. Rescisão", y, margin, pageW, pageH);
  y = arrowRow(doc, "", "Comunicação prévia de 30 (trinta) dias, ressalvadas as campanhas e obrigações já assumidas perante terceiros.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "", "A INTERMEDIADORA poderá rescindir o termo em caso de descumprimento de obrigação contratual, violação do Manual de Conduta, prática de ato ilícito ou conduta que cause dano à imagem ou reputação da INTERMEDIADORA ou de seus clientes.", margin, y, maxW, lh, pageH, margin);
  y += 3;

  // DISPOSIÇÕES GERAIS
  y = sectionHeader(doc, "6. Disposições Gerais", y, margin, pageW, pageH);
  y = arrowRow(doc, "Manual de Boas Práticas", "Integra este instrumento e estabelece regras de observância pela INFLUENCIADORA.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "Vínculo", "A presente parceria não estabelece vínculo empregatício, associativo ou de representação entre as PARTES.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "Confidencialidade", "A INFLUENCIADORA deverá manter sigilo sobre informações comerciais, estratégicas, financeiras, contratuais, campanhas, briefings, dados de clientes e demais informações confidenciais a que tiver acesso.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "Foro", "Comarca de Belo Horizonte/MG para dirimir eventuais controvérsias decorrentes deste termo.", margin, y, maxW, lh, pageH, margin);

  // Signature block
  y += 10;
  if (y > pageH - 90) { doc.addPage(); y = margin; }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text(`Belo Horizonte, ${dataAssinatura}.`, margin, y);
  y += 12;

  const colW = (maxW - 10) / 2;
  const col1X = margin;
  const col2X = margin + colW + 10;
  const imgH = 22;
  const baseY = y;

  // INTERMEDIADORA column
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(col1X, baseY + imgH, col1X + colW, baseY + imgH);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("INTERMEDIADORA", col1X, baseY + imgH + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text("LPX Consultoria e Intermediação Ltda", col1X, baseY + imgH + 9.5);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("CNPJ: 63.732.387/0001-90", col1X, baseY + imgH + 13.5);

  // INFLUENCIADORA column — with manuscript signature
  if (assinatura) {
    try {
      doc.addImage(assinatura, "PNG", col2X, baseY, colW, imgH);
    } catch (imgErr) {
      console.error("[PDF] erro ao inserir assinatura:", imgErr);
    }
  }
  doc.setDrawColor(180, 180, 180);
  doc.line(col2X, baseY + imgH, col2X + colW, baseY + imgH);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("INFLUENCIADORA", col2X, baseY + imgH + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text(nome, col2X, baseY + imgH + 9.5);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`CPF: ${cpf}`, col2X, baseY + imgH + 13.5);

  y = baseY + imgH + 22;

  // Metadata box
  if (y > pageH - 42) { doc.addPage(); y = margin; }
  doc.setFillColor(253, 241, 255);
  doc.roundedRect(margin, y, maxW, 32, 2, 2, "F");
  doc.setDrawColor(239, 39, 255);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, maxW, 32, 2, 2, "S");
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(239, 39, 255);
  doc.text("REGISTRO DE ASSINATURA ELETRÔNICA", margin + 5, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text(`E-mail: ${email}`, margin + 5, y);
  y += 4.5;
  doc.text(`Assinado em: ${dataHoraCompleta}`, margin + 5, y);
  y += 4.5;
  doc.text(`IP de origem: ${ip}`, margin + 5, y);

  // Footer + bottom bar on last page
  const lastPage = (doc.internal as { pages: unknown[] }).pages.length - 1;
  doc.setPage(lastPage);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text(
    "Documento gerado eletronicamente · LPX Consultoria e Intermediação Ltda · CNPJ: 63.732.387/0001-90",
    pageW / 2,
    pageH - 8,
    { align: "center" }
  );
  doc.setFillColor(239, 39, 255);
  doc.rect(0, pageH - 3, pageW, 3, "F");

  return doc;
}

function buildEmailHtml({ nome, dataHoraCompleta }: { nome: string; dataHoraCompleta: string }) {
  const nomeSafe = nome.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] ?? c));
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f0f0f2; }
    .wrap { max-width: 580px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    .top-bar { height: 4px; background: #EF27FF; }
    .header { background: #ffffff; padding: 24px 40px; text-align: center; border-bottom: 1px solid #f0f0f0; }
    .logo-img { height: 36px; width: auto; display: block; margin: 0 auto; }
    .body { padding: 40px; }
    .body h2 { color: #111; font-size: 18px; margin-bottom: 16px; }
    .body p { color: #555; font-size: 14px; line-height: 1.7; margin-bottom: 14px; }
    .card { background: #fdf1ff; border-left: 3px solid #EF27FF; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
    .card p { margin: 0; color: #333; font-size: 13px; }
    .checklist { list-style: none; margin: 0 0 20px; }
    .checklist li { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #555; padding: 7px 0; border-bottom: 1px solid #f0f0f0; }
    .check { width: 18px; height: 18px; border-radius: 50%; background: rgba(239,39,255,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #EF27FF; font-size: 11px; }
    .footer { background: #16171C; padding: 20px 40px; text-align: center; }
    .footer p { color: #444; font-size: 11px; }
    a { color: #EF27FF; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top-bar"></div>
    <div class="header">
      <img src="https://lpx-termos.vercel.app/LPXlogonova2.png" alt="LPX Marketing" class="logo-img" />
    </div>
    <div class="body">
      <h2>Termo de Parceria Assinado com Sucesso</h2>
      <p>Olá, <strong>${nomeSafe}</strong>!</p>
      <p>O Termo de Parceria Comercial (Modelo Permuta) foi registrado com sucesso. O documento completo em PDF está anexado a este e-mail.</p>
      <div class="card">
        <p><strong>Data e hora da assinatura:</strong><br>${dataHoraCompleta}</p>
      </div>
      <ul class="checklist">
        <li><span class="check">✓</span> Assinatura registrada com sucesso</li>
        <li><span class="check">✓</span> Termo arquivado com segurança</li>
        <li><span class="check">✓</span> Documento PDF em anexo</li>
      </ul>
      <p>Em caso de dúvidas, entre em contato pelo e-mail <a href="mailto:agencia@lpxmarketing.com">agencia@lpxmarketing.com</a>.</p>
    </div>
    <div class="footer">
      <p>LPX Consultoria e Intermediação Ltda · CNPJ: 63.732.387/0001-90</p>
    </div>
  </div>
</body>
</html>`;
}
