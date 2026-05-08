import {Component, Input} from '@angular/core';
import {Usuario} from '../../models/usuario';
import {Pedido} from '../../models/pedido';

declare var paypal: any;

@Component({
  selector: 'app-paypal-button',
  imports: [],
  templateUrl: './paypal-button.html',
  styleUrl: './paypal-button.css',
})
export class PaypalButton {

  @Input() totalCompra: number = 0;

  ngOnInit(): void {
    if (typeof paypal == "undefined") return;

    paypal.Buttons({
      createOrder: (_: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: this.totalCompra.toFixed(2)
            }
          }]
        });
      },

      onApprove: (_: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          this.crearPedidoYLimpiarCarrito();
          location.reload();
        });
      },

      onError: (error: any) => {
        console.error('Error en el pago:', error);
      }

    }).render('#paypal-button-container');
  }

  private crearPedidoYLimpiarCarrito(): void {
    if (typeof window === 'undefined') return;

    // Obtener el usuario actual
    const tokenString = localStorage.getItem("token");
    if (!tokenString) return;
    const payload = JSON.parse(atob(tokenString.split(".")[1]));
    if (!payload) return;

    const listaUsuariosString = localStorage.getItem("listaUsuarios");
    if (!listaUsuariosString) return;
    const listaUsuarios: Usuario[] = JSON.parse(listaUsuariosString);
    const usuarioIndex = listaUsuarios.findIndex(u => u.id == payload.id);
    if (usuarioIndex === -1) return;

    const usuario = listaUsuarios[usuarioIndex];

    // Crear el nuevo pedido
    const listaPedidosString = localStorage.getItem("listaPedidos");
    let listaPedidos: Pedido[] = listaPedidosString ? JSON.parse(listaPedidosString) : [];

    // Calcular el siguiente ID
    const nuevoId = listaPedidos.length > 0 ? Math.max(...listaPedidos.map(p => p.id)) + 1 : 1;

    // Calcular el siguiente número de factura
    const nuevoNumFactura = listaPedidos.length > 0 ? Math.max(...listaPedidos.map(p => p.numFactura)) + 1 : 1001;

    // Crear la lista de productos del pedido con sus precios
    const listaProductosString = localStorage.getItem("listaProductos");
    if (!listaProductosString) return;
    const listaProductos = JSON.parse(listaProductosString);

    const productosDelPedido = usuario.carrito.map((item: any) => {
      const producto = listaProductos.find((p: any) => p.id === item.idProducto);
      return {
        idProducto: item.idProducto,
        cantidad: item.cantidad,
        precio: producto ? producto.precio : 0
      };
    });

    // Calcular subprecio e IVA (21%)
    const subprecio = Number((this.totalCompra / 1.21).toFixed(2));
    const iva = Number((this.totalCompra - subprecio).toFixed(2));

    const nuevoPedido: Pedido = {
      id: nuevoId,
      idUsuario: usuario.id,
      fecha: new Date(),
      listaProductos: productosDelPedido,
      precioTotal: this.totalCompra,
      estado: "pendiente",
      numFactura: nuevoNumFactura,
      subprecio: subprecio,
      iva: iva
    };

    // Agregar el pedido a la lista
    listaPedidos.push(nuevoPedido);
    localStorage.setItem("listaPedidos", JSON.stringify(listaPedidos));

    // Limpiar el carrito del usuario
    listaUsuarios[usuarioIndex].carrito = [];
    localStorage.setItem("listaUsuarios", JSON.stringify(listaUsuarios));
  }
}
