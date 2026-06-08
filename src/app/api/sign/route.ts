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

    const dataAssinatura = format(assinado_em, "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    });
    const dataHoraCompleta = format(
      assinado_em,
      "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss",
      { locale: ptBR }
    );

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

    const fileName = `contrato-lpx-${nome.trim().replace(/\s+/g, "-").toLowerCase()}.pdf`;

    const recipients = ["leo@lpxmarketing.com", "vitoria@lpxmarketing.com", email.trim()];
    const uniqueRecipients = [...new Set(recipients)];
    console.log("[Resend] enviando para:", uniqueRecipients);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "LPX Marketing <noreply@lpxmarketing.com.br>",
      to: uniqueRecipients,
      subject: `Contrato de Uso de Imagem assinado — ${nome.trim()}`,
      html: buildEmailHtml({ nome: nome.trim(), dataHoraCompleta }),
      attachments: [{ filename: fileName, content: pdfBuffer }],
    });

    if (emailError) {
      console.error("[Resend] erro ao enviar:", JSON.stringify(emailError));
    } else {
      console.log("[Resend] email enviado com sucesso — id:", emailData?.id);
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

// Renders wrapped text, returns updated y
function txt(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number,
  pageH: number,
  margin: number
): number {
  const lines = doc.splitTextToSize(text, maxW);
  for (const line of lines) {
    if (y > pageH - 25) { doc.addPage(); y = margin; }
    doc.text(line, x, y);
    y += lh;
  }
  return y;
}

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
  doc.setTextColor(2, 0, 252);
  doc.text(title.toUpperCase(), margin, y);
  y += 2;
  doc.setDrawColor(2, 0, 252);
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
  margin: number
): number {
  if (y > pageH - 25) { doc.addPage(); y = margin; }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(2, 0, 252);
  doc.text(">", x, y);
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "bold");
  const labelText = " " + label + ": ";
  doc.text(labelText, x + 3, y);
  const labelW = doc.getTextWidth(labelText) + 3;
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

function buildPDF(params: PDFParams) {
  const { nome, cpf, endereco, email, dataAssinatura, dataHoraCompleta, ip, assinatura } = params;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxW = pageW - margin * 2;
  const lh = 5;
  let y = 0;

  // Blue top bar
  doc.setFillColor(2, 0, 252);
  doc.rect(0, 0, pageW, 4, "F");

  y = 14;

  // Document header
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
  doc.setDrawColor(2, 0, 252);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("CONTRATO DE LICENÇA E CESSÃO DE USO DE IMAGEM", pageW / 2, y, { align: "center" });
  y += 10;

  // PARTES
  y = sectionHeader(doc, "Partes", y, margin, pageW, pageH);
  y = labelRow(doc, "LICENCIADA", ":", "LPX Consultoria e Intermediação Ltda — CNPJ: 63.732.387/0001-90", margin, y, maxW, lh, pageH, margin);
  y = labelRow(doc, "LICENCIANTE", ":", `${nome} • CPF: ${cpf} — Residente em: ${endereco}`, margin, y, maxW, lh, pageH, margin);
  y += 3;

  // OBJETO E VIGÊNCIA
  y = sectionHeader(doc, "Objeto e Vigência", y, margin, pageW, pageH);
  y = arrowRow(doc, "O quê", "Imagem, voz, nome, likeness, fotos, vídeos, depoimentos e conteúdos audiovisuais produzidos pelo(a) LICENCIANTE.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "Para quê", "Campanhas publicitárias, ações institucionais, promocionais, comerciais e digitais da LICENCIADA.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "Onde", "Nacional e Internacional — todos os meios: mídias e plataformas digitais, redes sociais (Instagram, TikTok, Facebook, dentre outras), marketplaces, websites, TV, rádio, impresso, streaming, e tecnologias futuras.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "Prazo", "5 anos, com renovação automática. Rescisão mediante aviso escrito com 6 meses de antecedência.", margin, y, maxW, lh, pageH, margin);
  y = arrowRow(doc, "Pós-vigência", "Materiais já publicados podem permanecer em circulação, portfólio e histórico de campanhas sem custo adicional.", margin, y, maxW, lh, pageH, margin);
  y += 3;

  // DIREITOS DA LICENCIADA
  y = sectionHeader(doc, "Direitos da Licenciada", y, margin, pageW, pageH);
  y = labelRow(doc, "Uso e Edição", " —", "Editar, adaptar, cortar, reproduzir, sincronizar, impulsionar, legendar, traduzir, remixar, reutilizar e transformar materiais (sem autorização adicional).", margin, y, maxW, lh, pageH, margin);
  y = labelRow(doc, "Publicidade Digital", " —", "Campanhas patrocinadas, tráfego pago, dark posts, whitelisting, branded content e IA (sem autorização adicional).", margin, y, maxW, lh, pageH, margin);
  y = labelRow(doc, "Sublicenciamento", " —", "Grupo econômico, afiliadas, agências de publicidade, parceiros comerciais e prestadores de serviço.", margin, y, maxW, lh, pageH, margin);
  y += 3;

  // REMUNERAÇÃO
  y = sectionHeader(doc, "Remuneração", y, margin, pageW, pageH);
  y = txt(doc, "A remuneração ajustada entre as PARTES abrange integralmente todos os direitos previstos neste contrato, não sendo devida qualquer remuneração adicional, presente ou futura, a qualquer título.", margin, y, maxW, lh, pageH, margin);
  y += 3;

  // DECLARAÇÕES E GARANTIAS
  y = sectionHeader(doc, "Declarações e Garantias do(a) Licenciante", y, margin, pageW, pageH);
  y = txt(doc, "Possui plena capacidade e legitimidade para celebrar este contrato. Não possui exclusividade ou impedimento que restrinja os direitos aqui concedidos. Os materiais fornecidos não violam direitos autorais ou direitos de terceiros. Responde integralmente por reclamações judiciais ou extrajudiciais decorrentes dos materiais fornecidos. Eventual divulgação de material pelo(a) LICENCIANTE ocorrerá por mera liberalidade, não podendo a LICENCIADA exigir qualquer publicação, salvo ajuste expresso por escrito entre as PARTES.", margin, y, maxW, lh, pageH, margin);
  y += 3;

  // RESPONSABILIDADES ADICIONAIS
  y = sectionHeader(doc, "Responsabilidades Adicionais", y, margin, pageW, pageH);
  y = labelRow(doc, "Cláusula Moral", " —", "A LICENCIADA pode rescindir imediatamente caso o(a) LICENCIANTE pratique atos que afetem sua reputação: escândalos, crimes ou condutas ilícitas.", margin, y, maxW, lh, pageH, margin);
  y = labelRow(doc, "Indenização", " —", "O(A) LICENCIANTE indeniza a LICENCIADA por violação de direitos, falsidade de declarações, uso indevido de conteúdo e descumprimento contratual.", margin, y, maxW, lh, pageH, margin);
  y = labelRow(doc, "Confidencialidade", " —", "O(A) LICENCIANTE mantém sigilo sobre informações, estratégias, campanhas e dados da LICENCIADA, sob pena de responsabilização.", margin, y, maxW, lh, pageH, margin);
  y += 3;

  // DISPOSIÇÕES GERAIS
  y = sectionHeader(doc, "Disposições Gerais", y, margin, pageW, pageH);
  y = labelRow(doc, "Vínculo", ":", "Este contrato NÃO estabelece vínculo empregatício, societário ou representativo entre as partes.", margin, y, maxW, lh, pageH, margin);
  y = labelRow(doc, "Foro", ":", "Comarca de Belo Horizonte/MG para dirimir quaisquer controvérsias decorrentes deste contrato.", margin, y, maxW, lh, pageH, margin);

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

  // LICENCIADA column
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(col1X, baseY + imgH, col1X + colW, baseY + imgH);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("LICENCIADA", col1X, baseY + imgH + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text("LPX Consultoria e Intermediação Ltda", col1X, baseY + imgH + 9.5);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("CNPJ: 63.732.387/0001-90", col1X, baseY + imgH + 13.5);

  // LICENCIANTE column — with manuscript signature
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
  doc.text("LICENCIANTE", col2X, baseY + imgH + 5);
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
  doc.setFillColor(245, 245, 250);
  doc.roundedRect(margin, y, maxW, 32, 2, 2, "F");
  doc.setDrawColor(2, 0, 252);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, maxW, 32, 2, 2, "S");
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(2, 0, 252);
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
  doc.setFillColor(2, 0, 252);
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
    .top-bar { height: 4px; background: #0200FC; }
    .header { background: #16171C; padding: 32px 40px; text-align: center; }
    .logo { font-size: 22px; font-weight: 700; letter-spacing: 8px; color: #DEDEDC; }
    .logo-sub { font-size: 10px; letter-spacing: 6px; color: #555; margin-top: 5px; text-transform: uppercase; }
    .body { padding: 40px; }
    .body h2 { color: #111; font-size: 18px; margin-bottom: 16px; }
    .body p { color: #555; font-size: 14px; line-height: 1.7; margin-bottom: 14px; }
    .card { background: #f5f5ff; border-left: 3px solid #0200FC; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
    .card p { margin: 0; color: #333; font-size: 13px; }
    .checklist { list-style: none; margin: 0 0 20px; }
    .checklist li { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #555; padding: 7px 0; border-bottom: 1px solid #f0f0f0; }
    .check { width: 18px; height: 18px; border-radius: 50%; background: rgba(2,0,252,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #0200FC; font-size: 11px; }
    .footer { background: #16171C; padding: 20px 40px; text-align: center; }
    .footer p { color: #444; font-size: 11px; }
    a { color: #0200FC; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top-bar"></div>
    <div class="header">
      <div class="logo">LPX</div>
      <div class="logo-sub">Consultoria e Intermediação</div>
    </div>
    <div class="body">
      <h2>Contrato Assinado com Sucesso</h2>
      <p>Olá, <strong>${nomeSafe}</strong>!</p>
      <p>O Contrato de Licença e Cessão de Uso de Imagem foi registrado com sucesso. O documento completo em PDF está anexado a este e-mail.</p>
      <div class="card">
        <p><strong>Data e hora da assinatura:</strong><br>${dataHoraCompleta}</p>
      </div>
      <ul class="checklist">
        <li><span class="check">✓</span> Assinatura registrada com sucesso</li>
        <li><span class="check">✓</span> Contrato arquivado com segurança</li>
        <li><span class="check">✓</span> Documento PDF em anexo</li>
      </ul>
      <p>Em caso de dúvidas, entre em contato pelo e-mail <a href="mailto:contato@lpxmarketing.com">contato@lpxmarketing.com</a>.</p>
    </div>
    <div class="footer">
      <p>LPX Consultoria e Intermediação Ltda · CNPJ: 63.732.387/0001-90</p>
    </div>
  </div>
</body>
</html>`;
}
