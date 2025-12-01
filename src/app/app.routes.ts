import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
    },
    {
        path: 'productos/:id',
        loadComponent: () => import('./pages/detalles-producto/detalles-producto').then(m => m.DetallesProducto)
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.Login)
    },
    {
        path: 'registro',
        loadComponent: () => import('./pages/registro/registro').then(m => m.Registro)
    },
    {
        path: 'carrito',
        loadComponent: () => import('./pages/carrito/carrito').then(m => m.Carrito)
    },
    {
        path: 'productos',
        loadComponent: () => import('./pages/productos/productos').then(m => m.Productos)
    },
    {
        path: 'favoritos',
        loadComponent: () => import('./pages/favoritos/favoritos').then(m => m.Favoritos)
    },
    {
        path: 'historial-pedidos',
        loadComponent: () => import('./pages/historial-pedidos/historial-pedidos').then(m => m.HistorialPedidos)
    },
    {
        path: 'datos-personales',
        loadComponent: () => import('./pages/datos-personales/datos-personales').then(m => m.DatosPersonales)
    },
    {
        path: 'gestion-usuarios',
        loadComponent: () => import('./pages/gestion-usuarios/gestion-usuarios').then(m => m.GestionUsuarios)
    },
    {
        path: 'gestion-productos',
        loadComponent: () => import('./pages/gestion-productos/gestion-productos').then(m => m.GestionProductos)
    },
    {
        path: 'restablecimiento',
        loadComponent: () => import('./pages/restablecimiento/restablecimiento').then(m => m.Restablecimiento)
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];
