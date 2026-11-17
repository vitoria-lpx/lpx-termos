@AGENTS.md

# LPX Termos (`lpx-termos`)

Páginas de **Termo de Parceria Comercial** que a influenciadora assina eletronicamente. Ela abre o link do modelo que a LPX combinou com ela, lê o contrato, preenche os dados, escolhe uma assinatura cursiva e envia. O sistema grava o registro no Supabase, gera um **PDF** e manda por e-mail. Produção: https://termos.lpxmarketing.com.br (também https://lpx-termos.vercel.app).

Next 16.2.7 (App Router) + React 19 + Tailwind 4 + Supabase + Resend + jsPDF.

> O `AGENTS.md` importado acima avisa que este Next.js tem mudanças incompatíveis com o que os modelos conhecem. **Ler `node_modules/next/dist/docs/` antes de escrever código de framework.**

> **Este repositório é PÚBLICO** (`vitoria-lpx/lpx-termos`). Nunca commitar segredo, `.env*`, nem dado de influenciadora. O texto dos contratos e o código do PDF ficam visíveis para qualquer pessoa.

## Comandos

```sh
npm run dev     # next dev
npm run build   # next build
npm run lint    # eslint
```

Não há testes. **Repo próprio, separado do repo raiz `LPX APP`** (a pasta está no `.gitignore` da raiz). Remote `vitoria-lpx/lpx-termos`, branch `main`, e o fluxo histórico é **uma branch `feat/*` por mudança + PR** (PRs #1 a #8). Há um `src/components/python.code-workspace` untracked que não faz parte do projeto.

## Os quatro modelos

Cada modelo de negócio é uma rota própria, com texto jurídico próprio. A raiz `/` é **propositalmente uma página em branco** (decisão de 01/09/2026: o link certo é enviado a cada influenciadora, não há índice público).

| Rota | Modelo | Particularidades do texto |
|---|---|---|
| `/comissionado` | Comissionado | Comissão **entre 5% e 10%** do faturamento mensal; com MEI aplica-se o mínimo de 5%; sem comissão sobre venda vinda de **mídia paga (ads)**; saque liberado quando o saldo do mês atinge R$ 100 **ou** o faturamento do mês supera R$ 1.000 |
| `/comissionado-canfora` | Comissionado, parceria Canfora | Igual ao comissionado, com **limite de R$ 5.000** para saque e regra própria a partir de atingi-lo |
| `/cache-fixo` | Cachê fixo | Valor fixo previamente combinado, apurado mensalmente |
| `/permuta` | Permuta | Contrapartida em **produtos enviados pela marca** diretamente à influenciadora; sem valor em dinheiro e sem parte de CNAE |

Todos têm vigência de **14 meses, com renovação automática** (alterado em 08/09/2026; antes era 1 ano sem renovação) e orientação de **CNAE segmentada por MEI/ME** (22/09/2026), exceto a permuta, que não tem a parte de CNAE. Os valores acima são o que está no texto hoje; **o texto do contrato é jurídico e muda a pedido da Vitoria**, então confira o componente em vez de confiar nesta tabela.

## Estrutura

Cada modelo repete o mesmo trio:

- `src/app/<rota>/page.tsx` — cabeçalho e título, renderiza o layout.
- `src/components/ContractLayout<Modelo>.tsx` — o contrato inteiro: no mobile é um acordeão colapsado ("Ver contrato completo") com o formulário sempre visível abaixo; no desktop são duas colunas, contrato à esquerda e formulário fixo (sticky) à direita. No fim, `<TermForm apiPath="/api/sign-<rota>" />`.
- `src/app/api/sign-<rota>/route.ts` — recebe o POST, grava, gera o PDF, envia os e-mails (~470 linhas, incluindo o montador do PDF e o HTML do e-mail).

Compartilhados: `src/components/TermForm.tsx` (formulário, máscara de CPF, assinatura) e `src/app/sucesso/page.tsx` (tela de confirmação, recebe `?nome=`).

**O código dos 4 `route.ts` é copiado, não compartilhado.** Corrigir um bug no PDF, no e-mail ou na validação exige **repetir a correção nos quatro arquivos** (e conferir `ContractLayout*` quando for texto comum a todos). O `apiPath` padrão de `TermForm` (`/api/sign`) **não existe como rota**: modelo novo precisa passar o `apiPath` explicitamente.

## Formulário e assinatura

Campos: nome completo, CPF (máscara), endereço completo e e-mail. A assinatura é no estilo DocuSign: o nome em fonte cursiva (Dancing Script, Great Vibes ou Parisienne, carregadas do Google Fonts) mais um campo "Rubrica" com as iniciais. A assinatura é renderizada com a fonte escolhida e embutida no PDF.

## Banco (Supabase)

Tabela `termos_assinados`: `id`, `nome`, `cpf`, `endereco`, `email`, `ip`, `assinado_em`. RLS ligada **sem policy**: só o service role grava (as rotas usam `SUPABASE_SERVICE_ROLE_KEY`). Consulta pelo painel (Table Editor).

- **O banco não registra qual modelo foi assinado.** Os quatro `route.ts` inserem exatamente as mesmas colunas. Hoje a única forma de saber o modelo é o **nome do PDF anexado** (`termo-lpx-<modelo>-<nome>.pdf`) no e-mail enviado; o **assunto é o mesmo nos quatro** ("Termo de Parceria Comercial assinado — <nome>"). Se precisar de relatório por modelo, é preciso acrescentar uma coluna e preenchê-la nos 4 arquivos.
- O IP vem de `x-forwarded-for`/`x-real-ip` e é gravado como evidência da assinatura.
- As migrations em `supabase/migrations/` são `20260602_create_termos_assinados.sql` e `20260602_add_endereco.sql`. **Pela ordem alfabética, o `add_endereco` vem antes do `create`**: aplicadas em ordem num banco novo, o `ALTER` falha. Aplicar o `create` primeiro. Não são aplicadas por comando automático.

## E-mail (Resend)

Remetente `LPX Marketing <noreply@lpxmarketing.com.br>` (domínio verificado no Resend via Cloudflare). **Três envios individuais por assinatura**: Leo, Vitoria e a própria influenciadora, em um loop com uma chamada `resend.emails.send()` por destinatário. **Não usar `to: [...]` com vários destinatários**: o plano gratuito do Resend só entrega ao dono da conta. Os endereços de Leo e Vitoria estão fixos no código de cada `route.ts`. O PDF vai em anexo; o logo do cabeçalho do e-mail é carregado de `https://lpx-termos.vercel.app/LPXlogonova2.png`, então **trocar ou renomear esse arquivo em `public/` quebra o logo dos e-mails**.

Falha no envio de e-mail **não derruba a assinatura**: o registro já foi gravado, o erro só vai para o log.

## Envs

`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` (em uso). `.env.local` também tem `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SITE_URL`, mas **nada no código lê essas duas**. Não há `.env.example`.

## Deploy e domínio

Projeto Vercel `lpx-termos` (`prj_Hm7zaKsJbQAheq8HEhqwC2S6CIKm`), time `lpx-s-projects10`. **O push no GitHub não aciona deploy** (a anotação mais recente da Vitoria diz que a Git Integration não está ligada para este projeto): depois do merge, rodar de dentro da pasta:

```sh
npx vercel --prod
```

O commit `7613048` ("trigger redeploy now that repo is public") mostra que já houve ajuste de deploy ligado à visibilidade do repo; se um push parecer publicar sozinho, confirme no painel antes de assumir.

Domínio: `termos.lpxmarketing.com.br` é um **registro A para `76.76.21.21` no Cloudflare, com o proxy DESLIGADO (DNS only, nuvem cinza)** — obrigatório para a Vercel emitir o SSL. `lpxmarketing.com.br` tem DNS no Cloudflare; `lpxmarketing.com` (e-mail da equipe) está no Google Domains.

## Armadilhas

- Texto de contrato muda em PR separado, nos componentes `ContractLayout*`, e **mudança de cláusula comum precisa ser feita nos quatro**.
- O `manual-boas-praticas.pdf` em `public/` é linkado em todos os contratos; trocar o arquivo muda o que as influenciadoras veem.
- `tsconfig.tsbuildinfo` e `.next/` não devem ser commitados.
