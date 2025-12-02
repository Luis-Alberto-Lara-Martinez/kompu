import { Component, Input } from '@angular/core';
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
          location.reload();
        });
      },

      onError: (error: any) => {
        console.error('Error en el pago:', error);
      }

    }).render('#paypal-button-container');
  }
}
