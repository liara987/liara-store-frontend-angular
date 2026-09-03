export interface TranslationKeys {
  // ── Header ──────────────────────────────────────────
  searchPlaceholder: string;
  searchClear: string;
  cart: string;
  cartEmpty: string;
  cartCount: (n: number) => string;
  toggleTheme: string;

  // ── Home ────────────────────────────────────────────
  allProducts: string;
  resultsFor: string;
  loadingProducts: string;
  noResults: (q: string) => string;
  noProducts: string;
  clearSearch: string;
  addToCart: string;
  outOfStock: string;
  lastUnits: (n: number) => string;
  trustPix: string;
  trustNoShipping: string;
  trustPickup: string;
  trustSafe: string;
  filterAll: string;

  // ── Product detail ──────────────────────────────────
  breadcrumbStore: string;
  loadingProduct: string;
  productNotFound: string;
  inStock: (n: number) => string;
  soldOut: string;
  quantity: string;
  buyNow: string;
  addedToCart: string;

  // ── Cart page ───────────────────────────────────────
  cartTitle: string;
  emptyCartMsg: string;
  seeProducts: string;
  colProduct: string;
  colPrice: string;
  colQty: string;
  colSubtotal: string;
  decreaseQty: (name: string) => string;
  increaseQty: (name: string) => string;
  qtyOf: (name: string) => string;
  removeItem: string;
  removeItemOf: (name: string) => string;
  estimatedTotal: string;
  totalNote: string;
  clearCart: string;
  checkout: string;

  // ── Checkout ────────────────────────────────────────
  checkoutTitle: string;
  nameLbl: string;
  nameRequired: string;
  emailLbl: string;
  emailOptional: string;
  emailInvalid: string;
  emailHint: string;
  paymentLbl: string;
  generatingPix: string;
  generatePix: string;
  orderSummary: string;
  checkoutError: string;

  // ── Order ───────────────────────────────────────────
  loadingOrder: string;
  orderNotFound: string;
  orderTitle: (id: string) => string;
  statusPending: string;
  statusProcessing: string;
  statusPaid: string;
  statusCanceled: string;
  statusExpired: string;
  paymentConfirmed: string;
  thankYouEmail: (email: string) => string;
  payWithPix: string;
  pixAmountNote: (amount: string) => string;
  pixScanWithAmount: string;
  pixScanNoAmount: string;
  pixCodeLabel: string;
  copyCode: string;
  codeCopied: string;
  payByLink: string;
  orderCanceled: (status: string) => string;
  orderTotal: string;
  backToStore: string;

  // ── Cart drawer ─────────────────────────────────────
  drawerTitle: string;
  drawerEmpty: string;
  drawerNamePlaceholder: string;
  drawerNameRequired: string;
  drawerGeneratingPix: string;
  drawerGeneratePix: string;
  drawerFullCart: string;
  drawerPixError: string;
  drawerRemove: string;

  // ── Admin login ─────────────────────────────────────
  adminAreaTitle: string;
  adminEmail: string;
  adminPassword: string;
  adminLogin: string;
  adminLoggingIn: string;
  adminInvalidCreds: string;
  adminLoginError: string;

  // ── Footer ──────────────────────────────────────────
  followSocial: string;
}

export const translations: TranslationKeys = {
  searchPlaceholder: 'Buscar produtos, marcas e muito mais…',
  searchClear: 'Limpar busca',
  cart: 'Carrinho',
  cartEmpty: 'Carrinho vazio',
  cartCount: (n) => `Carrinho com ${n} item(ns)`,
  toggleTheme: 'Alternar tema',

  allProducts: 'Todos os produtos',
  resultsFor: 'Resultados para',
  loadingProducts: 'Carregando produtos…',
  noResults: (q) => `Nenhum produto encontrado para "${q}".`,
  noProducts: 'Nenhum produto disponível no momento.',
  clearSearch: 'Limpar busca',
  addToCart: 'Adicionar ao carrinho',
  outOfStock: 'Esgotado',
  lastUnits: (n) => `Últimas ${n} unidades`,
  trustPix: 'PIX instantâneo',
  trustNoShipping: 'Sem frete',
  trustPickup: 'Retirada na hora',
  trustSafe: 'Compra segura',
  filterAll: 'Todos',

  breadcrumbStore: 'Loja',
  loadingProduct: 'Carregando produto…',
  productNotFound: 'Produto não encontrado.',
  inStock: (n) => `${n} em estoque`,
  soldOut: 'Produto esgotado',
  quantity: 'Quantidade',
  buyNow: 'Comprar agora',
  addedToCart: 'Adicionado!',

  cartTitle: 'Carrinho',
  emptyCartMsg: 'Seu carrinho está vazio.',
  seeProducts: 'Ver produtos',
  colProduct: 'Produto',
  colPrice: 'Preço',
  colQty: 'Qtd.',
  colSubtotal: 'Subtotal',
  decreaseQty: (name) => `Diminuir quantidade de ${name}`,
  increaseQty: (name) => `Aumentar quantidade de ${name}`,
  qtyOf: (name) => `Quantidade de ${name}`,
  removeItem: 'Remover',
  removeItemOf: (name) => `Remover ${name}`,
  estimatedTotal: 'Total estimado',
  totalNote: 'O valor final é sempre calculado pelo backend no checkout.',
  clearCart: 'Limpar carrinho',
  checkout: 'Finalizar compra',

  checkoutTitle: 'Checkout',
  nameLbl: 'Nome *',
  nameRequired: 'Informe seu nome.',
  emailLbl: 'E-mail (opcional)',
  emailOptional: 'E-mail (opcional)',
  emailInvalid: 'E-mail inválido.',
  emailHint: 'Se informado, enviamos um e-mail de agradecimento após a confirmação do pagamento.',
  paymentLbl: 'Pagamento',
  generatingPix: 'Gerando PIX…',
  generatePix: 'Gerar PIX',
  orderSummary: 'Resumo',
  checkoutError: 'Não foi possível criar o pedido. Revise o carrinho e tente novamente.',

  loadingOrder: 'Carregando pedido…',
  orderNotFound: 'Pedido não encontrado.',
  orderTitle: (id) => `Pedido #${id}`,
  statusPending: 'Aguardando pagamento',
  statusProcessing: 'Processando',
  statusPaid: 'Pago',
  statusCanceled: 'Cancelado',
  statusExpired: 'Expirado',
  paymentConfirmed: 'Pagamento confirmado!',
  thankYouEmail: (email) => `— enviamos um e-mail de agradecimento para ${email}`,
  payWithPix: 'Pague com PIX',
  pixAmountNote: (amount) => `Valor a pagar: ${amount}`,
  pixScanWithAmount:
    'Escaneie o QR Code ou use o código copia e cola e digite o valor acima no app do banco. Depois é só mostrar o comprovante para a loja confirmar.',
  pixScanNoAmount:
    'Escaneie o QR Code ou use o código copia e cola. Depois mostre o comprovante para a loja confirmar o pagamento.',
  pixCodeLabel: 'Código PIX copia e cola',
  copyCode: 'Copiar código',
  codeCopied: 'Código copiado!',
  payByLink: 'Pagar pelo link do banco',
  orderCanceled: (status) => `Este pedido foi ${status.toLowerCase()}.`,
  orderTotal: 'Total',
  backToStore: 'Voltar para a loja',

  drawerTitle: 'Carrinho',
  drawerEmpty: 'Seu carrinho está vazio.',
  drawerNamePlaceholder: 'Nome completo',
  drawerNameRequired: 'Informe seu nome.',
  drawerGeneratingPix: 'Gerando PIX…',
  drawerGeneratePix: 'Gerar PIX e finalizar',
  drawerFullCart: 'Ou continue no carrinho completo',
  drawerPixError: 'Não foi possível gerar o PIX. Tente novamente ou use o carrinho completo.',
  drawerRemove: 'Remover',

  adminAreaTitle: 'Área administrativa',
  adminEmail: 'E-mail',
  adminPassword: 'Senha',
  adminLogin: 'Entrar',
  adminLoggingIn: 'Entrando…',
  adminInvalidCreds: 'E-mail ou senha inválidos.',
  adminLoginError: 'Não foi possível entrar. Tente novamente.',

  followSocial: 'Me siga nas redes sociais!',
};
