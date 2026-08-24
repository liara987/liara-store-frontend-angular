---
name: testing-liara-store
description: Como subir e testar end-to-end a Liara Store (backend Node/Express/Mongo + frontend Angular) localmente, incluindo loja, checkout PIX mock e área administrativa.
---

# Testar a Liara Store localmente

## Serviços necessários

1. MongoDB (Docker): `docker start liara-mongo` (porta 27017). Verifique com `docker ps`.
2. Backend (`liara-store-backend-node`, Node 20 serve):
   - `npm run seed` — cria 5 produtos de exemplo + admin (idempotente).
   - `npm run dev` — sobe em http://localhost:3000/api (health: `curl localhost:3000/api/health`).
   - Checks: `npm test` (vitest) e `npm run typecheck`.
3. Frontend (`liara-store-frontend-angular`, **precisa Node 22**):
   - `source ~/.nvm/nvm.sh && nvm use 22 && npm start` → http://localhost:4200
   - Build: mesmo `nvm use 22` antes de `npm run build`.

## Credenciais / configuração

- Admin: `admin@liara.store` / `liara-admin-123` (login em `/admin/login`; sessão JWT guardada em `localStorage` sob `liara-store:admin-session`).
- Pagamento é PIX com chave fixa: sem `PIX_COPY_PASTE` no `.env`, o backend gera um BR Code por pedido já com o valor; com `PIX_COPY_PASTE` (BR Code estático da loja) o código é sempre o mesmo e a tela do pedido pede que o cliente digite o valor. Não há confirmação automática nem webhook: quem confirma é o admin.
- Cloudinary e SMTP normalmente NÃO estão configurados: upload de imagem falha com erro 500 "Cloudinary não configurado…" e o e-mail de agradecimento nunca é enviado (apenas log). Isso é esperado em dev.

## Rotas úteis do frontend

- Loja: `/`, `/produto/:slug`, `/carrinho`, `/checkout`, `/pedido/:id`
- Admin: `/admin/login`, `/admin/dashboard`, `/admin/produtos`, `/admin/pedidos`
- Carrinho persiste em `localStorage` (`liara-store:cart`); para começar limpo, limpe o storage ou use "Limpar carrinho".

## Dicas de fluxo E2E

- O estoque só é decrementado quando o pagamento é confirmado — compare o estoque em `/admin/produtos` antes e depois.
- A página `/pedido/:id` faz polling a cada 5s: confirme o pagamento em outra aba (`/admin/pedidos` → "Confirmar pagamento") e aguarde ≤10s sem recarregar.
- Use duas abas (loja + admin) para observar a atualização automática.
- O dashboard só conta vendas **pagas do dia**; pedidos pendentes não aparecem nos KPIs.

## Pegadinhas conhecidas

- Sem Cloudinary, o upload de imagem falha por design: a tela de produtos deve mostrar a mensagem de erro **acima da tabela**, sem apagar a listagem.
- Produtos sem imagem renderizam um placeholder "sem imagem" na loja, nunca um `img` quebrado.

## Devin Secrets Needed

Nenhum. Cloudinary/SMTP são opcionais; o PIX com chave fixa cobre o fluxo completo sem credenciais externas.
