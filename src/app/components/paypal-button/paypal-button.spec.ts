import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaypalButton } from './paypal-button';

describe('PaypalButton', () => {
  let component: PaypalButton;
  let fixture: ComponentFixture<PaypalButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaypalButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaypalButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
