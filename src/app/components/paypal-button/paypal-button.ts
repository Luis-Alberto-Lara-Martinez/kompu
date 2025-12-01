import { Component, AfterViewInit } from '@angular/core';
declare var paypal: any;

@Component({
  selector: 'app-paypal-button',
  imports: [],
  templateUrl: './paypal-button.html',
  styleUrl: './paypal-button.css',
})
export class PaypalButton {

  ngOnInit(): void {
    if (typeof paypal == "undefined") return;

    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: '19.99' // 💰 precio del producto
            }
          }]
        });
      },

      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          alert(`Pago completado por ${details.payer.name.given_name}`);
          console.log('Detalles del pago:', details);
        });
      },

      onError: (err: any) => {
        console.error('Error en el pago:', err);
      }

    }).render('#paypal-button-container');
  }
}
