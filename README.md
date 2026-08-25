# Liara Store — Frontend (Angular)

Frontend da **Liara Store**: loja de acessórios de programação para venda presencial, com pagamento por PIX e área administrativa protegida.

Este repositório é a camada **Frontend Angular** da arquitetura:

```text
Navegador → Frontend Angular → Backend Node → MongoDB / Cloudinary / Provedor PIX / SMTP
```

O backend fica em [`liara-store-backend-node`](https://github.com/liara987/liara-store-backend-node) e é a **fonte da verdade** de preços, estoque, total, status do pedido e status do pagamento. O frontend nunca confirma pagamentos nem calcula o valor oficial da compra — os valores exibidos no carrinho são apenas uma estimativa até o pedido ser criado.

## Requisitos

- Node.js 22+ (o Angular CLI 22 exige `>= 22.22.3`)
- Backend rodando (por padrão em `http://localhost:3000`)

## Como rodar

```bash
npm install
npm start          # http://localhost:4200
```

Certifique-se de que a origem `http://localhost:4200` está em `CORS_ORIGINS` no backend.

## Configuração

A URL da API vive em `src/environments/`:

| Arquivo | Uso | `apiUrl` padrão |
| --- | --- | --- |
| `environment.ts` | desenvolvimento (`npm start`) | `http://localhost:3000/api` |
| `environment.production.ts` | build de produção (`npm run build`) | `/api` |

Ajuste `environment.production.ts` para a URL pública da API antes do deploy.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm start` | servidor de desenvolvimento |
| `npm run build` | build de produção em `dist/` |
| `npm test` | testes unitários (Vitest) |

## Estrutura

```text
src/app/
├── core/                # serviços, guard e interceptor (comunicação com a API)
│   ├── models.ts        # contratos da API (preços sempre em centavos)
│   ├── product.service.ts
│   ├── order.service.ts
│   ├── cart.service.ts  # carrinho em signals + localStorage
│   ├── auth.service.ts  # sessão do admin (JWT)
│   ├── admin.service.ts
│   ├── auth.interceptor.ts
│   └── admin.guard.ts
├── features/
│   ├── store/           # home, detalhe, carrinho, checkout, pedido/PIX
│   └── admin/           # login, layout, dashboard, produtos, pedidos
└── shared/cents.pipe.ts # centavos → R$
```

Componentes são standalone, com signals e rotas lazy-loaded.

## Rotas

### Loja

| Rota | Tela |
| --- | --- |
| `/` | catálogo com filtro por categoria |
| `/produto/:slug` | detalhe do produto |
| `/carrinho` | carrinho (quantidade, remoção) |
| `/checkout` | nome + e-mail opcional, gera o pedido |
| `/pedido/:id` | QR Code PIX, copia e cola, expiração e status |

A tela do pedido consulta o backend a cada 5 segundos até o pagamento ser confirmado; quando fica `paid`, exibe o agradecimento (e o backend envia o e-mail se o cliente informou um).

### Administração (protegida por JWT)

| Rota | Tela |
| --- | --- |
| `/admin/login` | login |
| `/admin/dashboard` | total vendido no dia, nº de vendas, estoque baixo, vendas recentes |
| `/admin/produtos` | cadastro, edição de estoque, upload de imagem (Cloudinary), ativar/desativar |
| `/admin/pedidos` | pedidos por status, confirmação manual de pagamento, cancelamento |

O token é guardado em `localStorage` e enviado como `Authorization: Bearer` apenas nas chamadas `/api/admin/*`; um `401` limpa a sessão e volta para o login.

## Notas de implementação

- Preços trafegam em **centavos** (inteiros) e são formatados pelo pipe `cents`.
- O carrinho envia apenas `productId` e `quantity`; o backend revalida produto, preço e estoque.
- Nenhum dado de cliente é persistido no frontend além do carrinho local.
