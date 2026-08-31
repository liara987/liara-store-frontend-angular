# Auditoria e correções de UX mobile

Auditoria e correções aplicadas à loja e à área administrativa, com foco em mobile
(WCAG 2.1 AA, Core Web Vitals e alvos de toque).

Ambiente da medição: build de produção (`npm run build`) servida localmente, backend local,
Lighthouse 13 no preset mobile padrão (Moto G Power simulado, 4G lento simulado) e medições
de layout com Chromium em 320, 375, 414, 768 e 812×375 (paisagem).

## Lighthouse — antes e depois

| Página | Performance | Acessibilidade | Boas práticas | SEO |
| --- | --- | --- | --- | --- |
| Home | 89 → 92 | 93 → 100 | 100 → 100 | 83 → 100 |
| Produto | 88 → 92 | 84 → 100 | 100 → 100 | 83 → 100 |
| Carrinho | 93 → 93 | 91 → 100 | 100 → 100 | 82 → 100 |
| Checkout | 91 → 89 | 91 → 100 | 100 → 100 | 82 → 100 |
| Login admin | 92 → 92 | 93 → 100 | 100 → 100 | 82 → 63\* |

\* O login administrativo agora é bloqueado no `robots.txt` (`Disallow: /admin`), o que o
Lighthouse contabiliza como "não rastreável". É intencional.

Core Web Vitals (laboratório, throttling simulado):

| Métrica | Antes | Depois | Meta |
| --- | --- | --- | --- |
| CLS (home) | 0,099 | 0 | < 0,1 |
| CLS (demais páginas) | 0–0,09 | 0 | < 0,1 |
| TBT (proxy de INP) | 20–40 ms | 20–40 ms | < 200 ms |
| LCP | 3,0–3,4 s | 2,8–3,2 s | < 2,5 s (não atingido) |

## Os 5 maiores problemas encontrados

1. **Contraste reprovado em toda a aplicação** — `#bca3fc` em botões primários dava 2,14:1
   (mínimo 4,5:1); preço, logo, filtros ativos e badges também reprovavam.
2. **Área administrativa quebrada no celular** — `/admin/produtos` (598 px) e `/admin/pedidos`
   (682 px) estouravam a largura de um viewport de 375 px.
3. **Alvos de toque abaixo de 48×48 px** — carrinho (110×19), logo (125×30), "Voltar para a
   loja" (139×22), filtros e botões `small` (34 px de altura) e inputs/botões (45 px).
4. **Tipografia abaixo de 16 px** — labels (13,6 px), cabeçalhos de tabela (12,5 px), hints,
   badges e rodapé; no iOS isso provoca zoom automático ao focar um campo.
5. **LCP 3,0–3,4 s e CLS 0,099 na home** — imagens sem dimensões reservadas nem `loading`/
   `fetchpriority`, ausência de estado de carregamento e falta de `<title>`/meta description.

## Correções implementadas

### 1. Paleta acessível e foco visível (`src/styles.css`)

- `--brand` passou de `#bca3fc` para `#6b3fd4` (6,39:1 com texto branco) e `--brand-dark` para
  `#4f2bb8` (8,86:1); `--muted`, `--ok`, `--warn` e `--danger` foram escurecidos para passar em
  4,5:1 nos fundos em que são usados.
- Badges de status ganharam par cor/fundo próprio (`--ok-soft`, `--warn-soft`, `--danger-soft`).
- `:focus-visible` global com contorno de 3 px, aplicável a qualquer elemento navegável por
  teclado.
- Suporte a `prefers-reduced-motion` desligando animações e transições.

Impacto: acessibilidade Lighthouse 84–93 → 100 em todas as páginas auditadas.

### 2. Tokens de toque e tipografia

- `--tap: 48px` aplicado como `min-height` a `.btn` (inclusive `.btn.small`), inputs, selects e
  textareas; links de navegação, logo, carrinho, breadcrumb e nav do admin viraram caixas
  flexíveis com a mesma altura mínima.
- `--gap-tap: 0.75rem` como espaçamento padrão entre controles adjacentes.
- Piso tipográfico de 1 rem (16 px): removidos todos os `font-size` de 0,75–0,95 rem em labels,
  hints, cabeçalhos de tabela, badges, rodapé e código PIX.
- Títulos passaram a usar `clamp()` para não quebrar em 320 px.

Impacto: nenhum alvo abaixo de 48×48 px e nenhum texto abaixo de 16 px em 320/375/414/768 px e
em paisagem (verificado por medição no navegador).

### 3. Tabelas administrativas viram cartões

- Classe global `.responsive-table`: até 900 px o `thead` é ocultado (mantido para leitores de
  tela), cada linha vira um cartão e cada célula exibe o rótulo via `data-label`.
- Aplicada em `/admin/produtos`, `/admin/pedidos` e no carrinho da loja.
- Botões de ação repetidos ganharam contexto para leitores de tela (`Confirmar pagamento do
  pedido de …`), e os inputs de estoque/quantidade ganharam `aria-label`.

Impacto: `/admin/produtos` e `/admin/pedidos` deixaram de estourar a largura — sem scroll
horizontal em nenhum dos breakpoints testados.

### 4. Produto e checkout

- Página de produto: preço e estoque acima da descrição, breadcrumb no lugar do link "voltar",
  e barra sticky no rodapé com preço e "Adicionar ao carrinho" (zona do polegar), com feedback
  "Adicionado!".
- Campo de quantidade com `<label>` associado e `inputmode="numeric"`.
- Checkout: resumo do pedido acima do formulário no mobile, `inputmode`, `autocomplete`,
  `autocapitalize`, `enterkeyhint`, `aria-invalid`, `aria-describedby` e mensagens de erro com
  `role="alert"`.
- Página do pedido: código PIX com `<label>` oculto, texto em 16 px com quebra, botão "Copiar
  código" em largura total e QR com proporção reservada.

### 5. Imagens, estados de carregamento e metadados

- Imagens de produto com `width`/`height`, `decoding="async"`, `loading="lazy"` abaixo da dobra
  e `fetchpriority="high"` na primeira imagem (LCP).
- Skeletons na home e na página de produto durante o carregamento, com `role="status"` para
  leitores de tela.
- `main` reserva a altura da janela (`min-height: 100svh`), o que eliminou o deslocamento do
  rodapé quando a lista de produtos chega — principal causa do CLS.
- `index.html`: `lang="pt-BR"`, `<title>` real, meta description, `theme-color` e
  `viewport-fit=cover`; `public/robots.txt` criado.

## Limitações e próximos passos

- **LCP continua em ~3 s** no laboratório. O gargalo é o tempo até o primeiro byte + download do
  bundle sob 4G simulado em uma SPA sem renderização no servidor; a página em si não tem
  recursos bloqueantes (nenhuma requisição render-blocking, TBT 20–40 ms). Para ficar abaixo de
  2,5 s o caminho é habilitar SSR/prerender do Angular e servir a aplicação por CDN — mudança
  de arquitetura que não foi feita aqui.
- **INP** não é medido em laboratório; foi usado o TBT (20–40 ms) como proxy.
- **WebPageTest** e **axe DevTools** não foram executados: são serviços/extensões externos que
  não estão disponíveis no ambiente local. As mesmas regras do axe foram verificadas via
  Lighthouse (categoria de acessibilidade 100).
- As imagens vêm do Cloudinary; a conversão para WebP/AVIF pode ser feita por transformação na
  URL (`f_auto,q_auto`) quando as imagens de produção estiverem cadastradas.
