import { Routes } from '@angular/router';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/store/home.page').then((m) => m.HomePage),
  },
  {
    path: 'produto/:slug',
    loadComponent: () =>
      import('./features/store/product-detail.page').then((m) => m.ProductDetailPage),
  },
  {
    path: 'carrinho',
    loadComponent: () => import('./features/store/cart.page').then((m) => m.CartPage),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/store/checkout.page').then((m) => m.CheckoutPage),
  },
  {
    path: 'pedido/:id',
    loadComponent: () => import('./features/store/order.page').then((m) => m.OrderPage),
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'produtos',
        loadComponent: () => import('./features/admin/products.page').then((m) => m.ProductsPage),
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/admin/orders.page').then((m) => m.OrdersPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
